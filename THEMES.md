
TODO: explain themes

Most themes can be configured/tweaked using LESS variables in your `-css` styles.
e.g.

```bash
thumbsup --css custom.less
```

```less
@myvar: #cef9b6;
@flag: false;
```

# Default

![default theme](docs/screenshot-default.jpg)

Config variables

| Variable    | Description |
|-------------|-------------|
| @accent     | Main theme color: title, some borders... |
| @background | Background color of the navigation and albums |
| @borders    | Border of all navigation and albums |
