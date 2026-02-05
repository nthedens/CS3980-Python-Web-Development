import functools

def echo(text: str, repetitions: int = 3) -> str:
    """imitate an echo"""
    echoed=[]
    for i in range(repetitions,0,-1):
        echoed.append(text[-i:])
    
    echoed.append(".")
    return "\n".join(echoed)


if __name__== "__main__":
    text = input("Yell something at a mountain: ")
    print(echo(text))