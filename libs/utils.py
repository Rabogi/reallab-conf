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
    
# test_replace_tags()

def exists(filename):
    return path.exists(filename)

def sha256(input: str):
    return hashlib.sha256((input).encode("utf-8")).hexdigest()