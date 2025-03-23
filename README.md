# PeckyBot

A heavily modified fork of AffectedAshes' ashesrobot for use in me and my
friends' streams.

## Documentation

This command returns the link to this Github page.

`!commands`

Those are all the main commands which are enabled in every channel.

### Moderator only Commands

Add, edit and delete (as long as they exist in the specific channel) commands with simple text responses.

`!addcmd <commandname> <response>`

`!editcmd <commandname> <newresponse>`

`!delcmd <commandname>`

### Database

This command lists all commands which are added to the database for the specific channel it gets used in.

`!cmds`

### Main Bot Commands

The list of commands for every user with their inputs and cooldowns.

### Hangman

Hangman Minigame (5 minute cooldown between each hangman game)

* `!hangman`
  
  starts the mingame

* `!guess <guess>`
  
  for guessing a letter or the full name

### Slots

Emote Slots Minigame

`!slots`

### Metronome

Guess a random Gen 1 Pokemon Move

`!metronome <move>`

### Randmon

Guess a random Gen 1 Pokemon

`!randmon <mon>`

### Randrunner

Get a random runner name

`!randrunner`

### Roll

Rolls a random number 1-max (inclusive)

`!roll <max>`

### Sroll

Rolls a random number 1-8192 (inclusive), 8192 is a win

`!sroll`

### SRC

Get the World Record or Personal Best from speedrun.com for a specified game, category and runner

* `!getwr <gameName>, <categoryName>, <var0>/<var1> - vars do not have to be provided (e.g. ENG, JPN, Console, Emulator, etc)`
* `!getpb <gameName>, <categoryName>, <runnerName>`
