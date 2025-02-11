def replace_tags(input: str,tags: dict):
    f = list(tags.keys())
    for tag in f:
        input = input.replace("%" + tag + "%", tags[tag])
    return input

def test_replace_tags():
    d = {
        "cat" : "Muska",
        "port" : "9999",
    }
    test = "lorem $ipsum$, the cats name is %cat% and cat, port %port% %port% asdadada%%%%%%%%%"
    
    print(replace_tags(test,d))
    
test_replace_tags()