# CS3980-Python-Web-Development 
## Python Refresher
### echo.py
The echo.py is meant to emulate the echo of an open space, it takes user input and returns the last three, then last 2, then last character of their input. In the case of an input less than 3 characters it returns all characters until it needs to remove one. The program use the function echo that takes a string and an integer that tells the number of repititions to perform, set to the default of 3. The function takes the last characters equal to the repititions value and prints to console the results removing one character at a time until it reaches the end. 
<img width="956" height="565" alt="image" src="https://github.com/user-attachments/assets/c443d428-f118-4a20-9c3f-f4e39cf13928" />
<img width="473" height="518" alt="image" src="https://github.com/user-attachments/assets/1d574529-23f6-4a1d-90a3-150b9eb464b3" />


### fib.py
fib calculates the fibonacci sequence from 1 to a given number n, recording runtime for each value of n and graphing the result. The program uses a decorator called timer to record the runtime of each step and print the result running the fib function for the fibonacci sequence, which is then made into a graph in main using the mtaplot library. The program uses least recently used cahching as well to massively improve runtime. This holds previous results of fib(n) so that they don't need to be recalculated, creating a more linear runtime rather than the exponential increase we see normally. This also prevents the overloading of print statements that would be created from recursion functions running. The runtime varies slightly but maintains a relatively similar magnntude of 100th of a second. The grpah of runtimes is shown below.
<img width="2400" height="1200" alt="image" src="https://github.com/user-attachments/assets/4652a6f6-f089-44ba-828b-e53ad9d88ff4" />
In this graph we can see a linear relationship with slight deviations, possibly due to other applications running at the same time. Without caching we would to exponential increase due to continuous recalculations of previous steps
