# "Doom" written in `bc`

The iTerm2 terminal has long included a tool for displaying images in the console, and I was looking for a reason to use it to make an interesting project. In the end, I created a port of the game Wolf5k, originally written in JavaScript.

During the process, I had to face a lot of difficulties. The thing is, `bc` is a fairly simple language. For example, it lacks any built-in functionality for graphics output. In order to work with graphics, I had to develop my own base64 encoding function and generate images in BMP format.

I had to struggle, inventing various things that aren't available in the language. In the end, I managed to port the game in a day and spent the following day leisurely fixing bugs.

The controls in the game are managed with the `A`, `S`, `D`, `W` keys or `J`, `K`, `L`, `M`, Space — to shoot.

![screen](https://github.com/user-attachments/assets/cd5ded36-c65b-4357-a90b-67db261c579c)

# Requirements:

- BSD bc 6.5.0+
- iTerm2
- zsh

# Special thanks:

Many thanks to Lee Semel, the author of the original game Wolf5k, which can be found [in the repository](https://github.com/parkertomatoes/wolf5k/). Also, many thanks to the person who performed the [partial deobfuscation](https://web.archive.org/web/20041208223205/http://www.icarusindie.com/DoItYourSelf/javascript3D/deobfwolk5k.php) of the original game's code.
