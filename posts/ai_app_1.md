# Your First AI-Powered App

This series is about how to use AI as a practical tool to power real applications. In this post we'll build a simple game, and you'll see how easy it is to plug a modern LLM into your code, and how the results can be surprisingly powerful.

## Accessing AI

We will access models through an application programming interface (API). Calling an API involves sending your message to a model and reading the reply, just like you do with ChatGPT.

I use OpenRouter's API because it allows access to a huge selection of models, including free ones. To follow along, you'll need an OpenRouter account and API key. It's easy to do right from [their homepage](https://openrouter.ai/), and no payment is required.

## Your First AI Call

First, make sure you have the Python `requests` library:

```bash
pip install requests
```

Here's the function we'll use to call our API:

```python
def ask_ai(prompt):
    import requests
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": "Bearer <YOUR_API_KEY>"},
        json={"model": "arcee-ai/trinity-mini:free",
              "messages": [{"role": "user", "content": prompt}]}
    )
    return response.json()["choices"][0]["message"]["content"]
  ```

Replace `<YOUR_API_KEY>` with the key from your OpenRouter account. Keep this key secret, it's tied to your account like a password. Do not include it in any code you share publicly.

Don't worry about what's inside this function, we'll break it down later. For now, all you need to know is that `ask_ai("your question")` asks the model "your question" and returns the answer as a string. 

```python
ask_ai("What's the meaning of life?")
# "That's one of humanity's oldest and most profound questions!..."
```

## What Can You Do With This

Since `ask_ai` takes a single string and returns a single string, plugging it into existing code is a breeze. Here's a clever function to tell if a number is even:

```python
def  is_even(num):
	answer  =  ask_ai(f"If {num} is even, respond 'yes' and no other characters")
	return  answer  ==  "yes"
```

Just kidding.

This is a bit silly, but it highlights a point: AI can stand in for pretty much anything you would otherwise have to program yourself. The big question of AI inclusion isn't whether you *can* but whether you *should*.

## What You Should Do With This

Let's look at a case where you *should* use AI. I got the idea for this game "Bigger than a Billion" from a dream. In the game, the player must come up with a number bigger than 1 billion, then a number bigger than that, and so on.

A simple implementation might look like this:

```python
def  is_bigger(a, b):
	return  a  >  b

current_num  =  1000000000 # start at 1 billion
while  True:
	print(f"What's bigger than {current_num}?")
	user_num  =  int(input())
	answer = is_bigger(user_num, current_num)
	if  answer:
		current_num  =  user_num
		print("Correct!")
	else:
		print("Sorry, no")
```

Here's what a game looks like:

```
What's bigger than 1000000000.0?
1000000001
Correct!
What's bigger than 1000000001?
67
Sorry, no
```

Boring!

In my dream, you were allowed to give numbers in any form, even as a complicated description like `500 x the number of trees in Texas`. This feature is what makes the game interesting, but comparing these sorts of "numbers" is impossible to do with code.

Fortunately, we can just `ask_ai`! The response might be slower, and it won't always be accurate, but it's definitely a worthy tradeoff. All we have to do is update our `is_bigger` function and use strings to keep track of our "free form" numbers:

```python
def  is_bigger(a, b):
	answer  =  ask_ai(f"If the number '{a}' is bigger than the number '{b}', respond 'yes' and nothing else")
	return  answer  ==  "yes"

current_num  =  "a Billion"
while  True:
	print(f"What's bigger than {current_num}?")
	user_num  =  input()
	answer = is_bigger(user_num, current_num)
	if  answer:
		current_num  =  user_num
		print("Correct!")
	else:
		print("Sorry, no")
```

And now the game is much more interesting:

```
What's bigger than a Billion?
a billion + 1
Correct!
What's bigger than a billion + 1?
the number of fish in the Atlantic
Correct!
What's bigger than the number of fish in the Atlantic?
pi * the circumference of mars in inches
Sorry, no
What's bigger than the number of fish in the Atlantic?
555^999
Correct!
```

## What's Next?

With just a simple `ask_ai` function in hand, you can already build a lot. However, the simplicity of this function removes the raw control that makes API calling so powerful.

In the next post, we'll polish our game up, fix a major security flaw, and learn how to swap out the brain behind it.