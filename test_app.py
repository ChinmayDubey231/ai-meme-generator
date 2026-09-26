# test_app.py
# Run with: python -m pytest

from io import BytesIO
from unittest.mock import patch

import pytest
from PIL import Image

import app as app_module
from ai_client import AIGenerationError
from meme_generator import MemeGenerator, TemplateError


@pytest.fixture
def client():
    app_module.app.config['TESTING'] = True
    with app_module.app.test_client() as c:
        yield c


def _is_png(data):
    img = Image.open(BytesIO(data))
    return img.format == 'PNG' and img.size[0] > 0


def test_meme_creation_local_template():
    result = MemeGenerator().create_meme("drake.jpg", "top text", "bottom text")
    assert result and _is_png(result)


def test_meme_with_custom_texts_and_long_words():
    custom = [{"text": "hello", "x": 20, "y": 30, "size": 10},
              {"text": "x", "x": "bad", "y": 500}]
    result = MemeGenerator().create_meme("drake.jpg", "A" * 150, "", custom)
    assert result and _is_png(result)


def test_path_traversal_is_blocked():
    with pytest.raises(TemplateError):
        MemeGenerator().create_meme("../../app.py", "a", "b")


def test_remote_template_host_is_restricted():
    with pytest.raises(TemplateError):
        MemeGenerator().create_meme("http://169.254.169.254/latest", "a", "b")


def test_index_lists_local_templates(client):
    res = client.get('/')
    assert res.status_code == 200
    assert b'value="drake.jpg"' in res.data


def test_generate_meme_endpoint(client):
    res = client.post('/generate_meme', json={"template": "drake.jpg", "top_text": "hi"})
    assert res.status_code == 200
    assert res.mimetype == 'image/png'
    assert _is_png(res.data)


@pytest.mark.parametrize("payload", [None, {}, {"template": "missing.jpg"},
                                     {"template": "https://evil.example.com/x.png"}])
def test_generate_meme_bad_input_returns_400(client, payload):
    res = client.post('/generate_meme', json=payload) if payload is not None \
        else client.post('/generate_meme', data="not json")
    assert res.status_code == 400
    assert 'error' in res.get_json()


def test_generate_template_clamps_size(client):
    res = client.post('/generate_template', json={
        "width": 100000, "height": "abc",
        "text_boxes": [{"text": "hi", "font_size": 99999}]})
    assert res.status_code == 200
    img = Image.open(BytesIO(res.data))
    assert img.size == (2000, 600)


def test_generate_template_bad_color(client):
    res = client.post('/generate_template', json={"background_color": "notacolor"})
    assert res.status_code == 400


def test_generate_poster_requires_prompt(client):
    assert client.post('/generate_poster', json={"prompt": "  "}).status_code == 400


def test_generate_poster_reports_ai_errors(client):
    with patch('meme_generator.ai_client.generate_image',
               side_effect=AIGenerationError("model warming up")):
        res = client.post('/generate_poster', json={"prompt": "a cat"})
    assert res.status_code == 502
    assert res.get_json()['error'] == "model warming up"


def test_generate_poster_success(client):
    buf = BytesIO()
    Image.new('RGB', (10, 10)).save(buf, format='PNG')
    with patch('meme_generator.ai_client.generate_image', return_value=buf.getvalue()):
        res = client.post('/generate_poster', json={"prompt": "a cat"})
    assert res.status_code == 200
    assert res.mimetype == 'image/png'
