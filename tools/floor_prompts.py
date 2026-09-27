"""Prompt builder for the generated floors (3-10): two fixed layouts per floor, one decor theme per floor."""
import json, sys
STYLE = ("Match the illustration style of the reference image exactly: stylized art deco mobile game art, palette of midnight blue, "
         "deep teal, gold, amber and black, clean vector-like shapes, flat shading with subtle gradients, moody warm lamplight, thin mist "
         "on the floor, vertical portrait composition, no people, no text, no letters, no numbers anywhere. ")
LAYOUT = {
 "A": ("Scene: a hotel corridor facing a single dark wooden guest room door exactly centered in the frame, with a blank rectangular brass "
       "plate at eye level on the door. Right of the door, at handle height, a brass electronic keypad panel with blank buttons, and directly "
       "above the keypad a single art deco brass wall sconce with a frosted glass shade. Left of the door, at eye level, a small framed "
       "picture in a brass frame with a plain dark canvas. On the checkered marble floor in front of the door lies a small folded white note card. "),
 "B": ("Scene: a hotel corridor facing a single dark wooden guest room door exactly centered in the frame, with a blank rectangular brass "
       "plate at eye level on the door. Above the door, a horizontal row of four identical unlit art deco brass wall sconces with frosted "
       "shades, evenly spaced. Right of the door a tall rectangular brass panel with a plain blank front face. Left of the door, at waist "
       "height, a small wall shelf holding a few small brass objects. On the checkered marble floor in front of the door lies a small folded white note card. "),
}
THEMES = {
 3: "Decor of the ballroom floor: mirrored wall panels, a red carpet runner on the checkered floor, crystal sconces.",
 4: "Decor of the library floor: tall dark bookshelves full of leather books flank the corridor, a brass reading lamp glow.",
 5: "Decor of the bath floor: pale green and white tiled walls with gold trim, thin steam drifting, a brass towel rail.",
 6: "Decor of the kitchen floor: white subway tiles with gold trim, copper pots hanging from a rail above, warm oven light.",
 7: "Decor of the observatory floor: deep midnight blue walls covered in brass star charts, a small brass telescope on a stand.",
 8: "Decor of the gallery floor: red velvet walls hung with many small gold-framed paintings, a brass velvet rope.",
 9: "Decor of the penthouse floor: white marble walls with gold leaf inlays, potted palms in gold planters, a crystal chandelier.",
 10: "Decor of the rooftop floor: night sky visible through a glass skylight, distant city lights, a soft pink neon glow from outside.",
}
def prompt(floor, layout):
    return STYLE + LAYOUT[layout] + THEMES[floor]
if __name__ == "__main__":
    print(json.dumps({f"{f}{l}": prompt(f, l) for f in THEMES for l in "AB"}, indent=1))
