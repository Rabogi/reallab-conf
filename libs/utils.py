import hashlib
from os import path


def replace_tags(input: str, tags: dict):
    f = list(tags.keys())
    for tag in f:
        input = input.replace("%" + tag + "%", str(tags[tag]))
    return input


def test_replace_tags():
    d = {
        "cat": "Muska",
        "port": "9999",
    }
    test = "lorem $ipsum$, the cats name is %cat% and cat, port %port% %port% asdadada%%%%%%%%%"

    print(replace_tags(test, d))


def embed_in_template(template, content, marker, scripts=None, scripts_marker=None):

    main_content_marker = marker
    if scripts_marker:
        scripts_marker = scripts_marker

    if main_content_marker not in template:
        raise ValueError("Template missing "+marker+" marker")

    template = template.replace(main_content_marker, content)

    if scripts:
        script_tags = "\n".join(
            f'<script src="{script}"></script>' for script in scripts
        )
        if scripts_marker in template:
            template = template.replace(scripts_marker, script_tags)
        else:
            template += f"\n{script_tags}"
    return template


# test_replace_tags()


def exists(filename):
    return path.exists(filename)


def sha256(input: str):
    return hashlib.sha256((input).encode("utf-8")).hexdigest()


def sha512(input: str):
    return hashlib.sha512((input).encode("utf-8")).hexdigest()
