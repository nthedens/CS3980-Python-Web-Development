import functools
import time
import matplotlib.pyplot as plt

#fib.py
# hold runtime and results data
fib_data = []
def timer(func):

    """track runtime of each fibonacci n and record data"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time

        fib_data.append((args[0],elapsed_time))

        print(f"Finished in {elapsed_time:.10f}s: f({args[0]}) -> {result}")
        return result
    
    return wrapper

@functools.lru_cache(maxsize=200)
@timer
# fibonacci calculation
def fib(n: int) -> int:
    """Perform calculation of fibonacci given n"""
    if n in (0,1):
        return n
    return fib(n-1)+ fib(n-2)

if __name__== "__main__":
    fib(100)
    fib_values = [data[0] for data in fib_data]
    times = [data[1] for data in fib_data]

    # create figure
    plt.figure(figsize=(12, 6))
    plt.plot(fib_values, times)
    plt.xlabel('fibonacci number')
    plt.ylabel('Time (seconds)')
    plt.title('Fibonacci RunTime with LRU Caching')
    plt.grid(True)
    plt.tight_layout()
    
    # Save the plot
    plt.savefig('fib.png', dpi=200)
    print(f"\nPlot saved as 'fib.png'")