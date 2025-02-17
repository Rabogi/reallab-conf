import hashlib
from os import path

def replace_tags(input: str,tags: dict):
    f = list(tags.keys())
    for tag in f:
        input = input.replace("%" + tag + "%", str(tags[tag]))
    return input

def test_replace_tags():
    d = {
        "cat" : "Muska",
        "port" : "9999",
    }
    test = "lorem $ipsum$, the cats name is %cat% and cat, port %port% %port% asdadada%%%%%%%%%"
    
    print(replace_tags(test,d))
    
def embed_in_template(template, content, scripts=None):

    main_content_marker = '<!-- MAIN_CONTENT -->'
    script_marker = '<!-- SCRIPTS -->'

    if main_content_marker not in template:
        raise ValueError("Template missing MAIN_CONTENT marker")

    template = template.replace(main_content_marker, content)

    if scripts:
        script_tags = '\n'.join(f'<script src="{script}"></script>' for script in scripts)
        if script_marker in template:
            template = template.replace(script_marker, script_tags)
        else:
            template += f'\n{script_tags}'
    return template
# test_replace_tags()

def exists(filename):
    return path.exists(filename)

def sha256(input: str):
    return hashlib.sha256((input).encode("utf-8")).hexdigest()