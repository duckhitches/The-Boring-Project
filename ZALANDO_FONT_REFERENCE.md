# Zalando Sans SemiExpanded Font Classes Reference

## Available Font Weights

### Normal Styles
- `.zalando-sans-semiexpanded-light` - Weight: 200
- `.zalando-sans-semiexpanded-normal` - Weight: 400 (default)
- `.zalando-sans-semiexpanded-medium` - Weight: 500
- `.zalando-sans-semiexpanded-semibold` - Weight: 600
- `.zalando-sans-semiexpanded-bold` - Weight: 700
- `.zalando-sans-semiexpanded-extrabold` - Weight: 800
- `.zalando-sans-semiexpanded-black` - Weight: 900

### Italic Styles
- `.zalando-sans-semiexpanded-light-italic` - Weight: 200, Style: italic
- `.zalando-sans-semiexpanded-normal-italic` - Weight: 400, Style: italic
- `.zalando-sans-semiexpanded-medium-italic` - Weight: 500, Style: italic
- `.zalando-sans-semiexpanded-semibold-italic` - Weight: 600, Style: italic
- `.zalando-sans-semiexpanded-bold-italic` - Weight: 700, Style: italic
- `.zalando-sans-semiexpanded-extrabold-italic` - Weight: 800, Style: italic
- `.zalando-sans-semiexpanded-black-italic` - Weight: 900, Style: italic

## Tailwind CSS Usage

You can also use the Tailwind class:
- `font-zalando` - Applies Zalando Sans SemiExpanded font family

## Usage Examples

```jsx
// Using CSS classes
<h1 className="zalando-sans-semiexpanded-bold">Bold Heading</h1>
<p className="zalando-sans-semiexpanded-normal">Normal text</p>
<em className="zalando-sans-semiexpanded-medium-italic">Italic text</em>

// Using Tailwind class
<div className="font-zalando font-semibold">Semibold text</div>
```

## Implementation Details

- Font is loaded from Google Fonts
- Includes all weights from 200 to 900
- Includes both normal and italic styles
- Optimized with `font-display: swap` for better performance
- Applied globally throughout the project
