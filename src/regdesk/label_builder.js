import { LabelEpl } from 'WebZLP/src/LabelEpl'

/**
 * Line offset record
 */
class LineOffset {
  static get alignmentPoints() { return ["center", "left", "right"]; }

  /**
   * Gets a value indicating to use the full label width.
   */
  // TODO: Enum?
  static get fullLabelWidth() { return -1; }

  /**
   * Gets a value indicating to center on a label.
   */
  // TODO: Enum?
  static get centeredOnLabel() { return -1; }

  /**
   * Initializes a new instance of the LineOffset class.
   * @param {string} alignmentPoint - Where to align the text from. 'center', 'left', or 'right'.
   * @param {boolean} isBold - Whether the text should be bold.
   * @param {number} maxWidth - The maximum width the text can occupy, in pixels. -1 means 'full label width'.
   * @param {number} maxHeight - The maximum height the text can occupy, in pixels.
   * @param {number} offsetX - The horizontal canvas offset to the alignment point. -1 means 'centered'.
   * @param {number} offsetY - The vertical canvas offset to the alignment point.
   */
  constructor (
    alignmentPoint,
    isBold,
    maxWidth,
    maxHeight,
    offsetX,
    offsetY
  ) {
    if (!this.constructor.alignmentPoints.includes(alignmentPoint)) {
      throw new Error(`Invalid alignment point '${alignmentPoint}', must be one of ${this.constructor.alignmentPoints.join(', ')}.`);
    }
    this.alignmentPoint = alignmentPoint;

    this.isBold = isBold;
    this.maxHeight = maxHeight;
    this.maxWidth = maxWidth;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }
}

/**
 * Class for creating a badge label.
 */
export class BadgeLabelBuilder {

  /**
   * Get the font family the label should be using.
   */
  static get fontFamily() { return "twemoji, sans-serif"; }

  /**
   * Get the line offset information for lines on a badge.
   */
  static get lineOffsets() {
    return {
      // Manually calculated offsets to figure out a good mapping for a label
      // with a width of 589px and height of 193px.
      // These will absolutely need to be recalculated for other sizes.
      "line1": new LineOffset("center", true, LineOffset.fullLabelWidth, 110, LineOffset.centeredOnLabel, 50),
      "line2": new LineOffset("center", true, LineOffset.fullLabelWidth, 53, LineOffset.centeredOnLabel, 130),
      "level": new LineOffset("center", false, 400, 40, LineOffset.centeredOnLabel, 175),
      "minor": new LineOffset("right", false, 95, 20, 585, 180),
      "badge": new LineOffset("left", false, 95, 20, 5, 180),
    };
  }

  /**
   * Initializes a new instance of the LabelBuilder class.
   * @param {object} o - Parameter object
   * @param {string} o.line1 - First line of badge text
   * @param {string} o.line2 - Second line of badge text
   * @param {string} o.badgeId - Badge ID, lower left corner
   * @param {string} o.level - Membership level
   * @param {boolean} o.isMinor - Whether the badge is for a minor
   */
  constructor({
    line1,
    line2,
    badgeId,
    level,
    isMinor
  }) {
    this.line1 = line1;
    this.line2 = line2;
    this.badgeId = badgeId;
    this.level = level.toUpperCase();
    this.isMinor = isMinor === true;
  }

  /**
   * Load the custom fonts for this label builder to use. Run this before building any labels.
   * @param {Document} doc
   */
  static async loadCustomFonts(doc) {
    // Range of unicode characters that we expect to be emoji.
    // This is probably out of date but it's also probably good enough.
    // We'll see if any badges come out looking wonky.
    const emojiUnicodeRange = "U+0023,U+002A,U+0030-0039,U+00A9,U+00AE,U+203C,U+2049,U+2122,U+2139,U+2194-2199,U+21A9-21AA,U+231A-231B,U+2328,U+23CF,U+23E9-23F3,U+23F8-23FA,U+24C2,U+25AA-25AB,U+25B6,U+25C0,U+25FB-25FE,U+2600-2604,U+260E,U+2611,U+2614-2615,U+2618,U+261D,U+2620,U+2622-2623,U+2626,U+262A,U+262E-262F,U+2638-263A,U+2640,U+2642,U+2648-2653,U+265F-2660,U+2663,U+2665-2666,U+2668,U+267B,U+267E-267F,U+2692-2697,U+2699,U+269B-269C,U+26A0-26A1,U+26AA-26AB,U+26B0-26B1,U+26BD-26BE,U+26C4-26C5,U+26C8,U+26CE,U+26CF,U+26D1,U+26D3-26D4,U+26E9-26EA,U+26F0-26F5,U+26F7-26FA,U+26FD,U+2702,U+2705,U+2708-2709,U+270A-270B,U+270C-270D,U+270F,U+2712,U+2714,U+2716,U+271D,U+2721,U+2728,U+2733-2734,U+2744,U+2747,U+274C,U+274E,U+2753-2755,U+2757,U+2763-2764,U+2795-2797,U+27A1,U+27B0,U+27BF,U+2934-2935,U+2B05-2B07,U+2B1B-2B1C,U+2B50,U+2B55,U+3030,U+303D,U+3297,U+3299,U+1F004,U+1F0CF,U+1F170-1F171,U+1F17E,U+1F17F,U+1F18E,U+1F191-1F19A,U+1F1E6-1F1FF,U+1F201-1F202,U+1F21A,U+1F22F,U+1F232-1F23A,U+1F250-1F251,U+1F300-1F320,U+1F321,U+1F324-1F32C,U+1F32D-1F32F,U+1F330-1F335,U+1F336,U+1F337-1F37C,U+1F37D,U+1F37E-1F37F,U+1F380-1F393,U+1F396-1F397,U+1F399-1F39B,U+1F39E-1F39F,U+1F3A0-1F3C4,U+1F3C5,U+1F3C6-1F3CA,U+1F3CB-1F3CE,U+1F3CF-1F3D3,U+1F3D4-1F3DF,U+1F3E0-1F3F0,U+1F3F3-1F3F5,U+1F3F7,U+1F3F8-1F3FF,U+1F400-1F43E,U+1F43F,U+1F440,U+1F441,U+1F442-1F4F7,U+1F4F8,U+1F4F9-1F4FC,U+1F4FD,U+1F4FF,U+1F500-1F53D,U+1F549-1F54A,U+1F54B-1F54E,U+1F550-1F567,U+1F56F-1F570,U+1F573-1F579,U+1F57A,U+1F587,U+1F58A-1F58D,U+1F590,U+1F595-1F596,U+1F5A4,U+1F5A5,U+1F5A8,U+1F5B1-1F5B2,U+1F5BC,U+1F5C2-1F5C4,U+1F5D1-1F5D3,U+1F5DC-1F5DE,U+1F5E1,U+1F5E3,U+1F5E8,U+1F5EF,U+1F5F3,U+1F5FA,U+1F5FB-1F5FF,U+1F600,U+1F601-1F610,U+1F611,U+1F612-1F614,U+1F615,U+1F616,U+1F617,U+1F618,U+1F619,U+1F61A,U+1F61B,U+1F61C-1F61E,U+1F61F,U+1F620-1F625,U+1F626-1F627,U+1F628-1F62B,U+1F62C,U+1F62D,U+1F62E-1F62F,U+1F630-1F633,U+1F634,U+1F635-1F640,U+1F641-1F642,U+1F643-1F644,U+1F645-1F64F,U+1F680-1F6C5,U+1F6CB-1F6CF,U+1F6D0,U+1F6D1-1F6D2,U+1F6D5,U+1F6E0-1F6E5,U+1F6E9,U+1F6EB-1F6EC,U+1F6F0,U+1F6F3,U+1F6F4-1F6F6,U+1F6F7-1F6F8,U+1F6F9,U+1F6FA,U+1F7E0-1F7EB,U+1F90D-1F90F,U+1F910-1F918,U+1F919-1F91E,U+1F91F,U+1F920-1F927,U+1F928-1F92F,U+1F930,U+1F931-1F932,U+1F933-1F93A,U+1F93C-1F93E,U+1F93F,U+1F940-1F945,U+1F947-1F94B,U+1F94C,U+1F94D-1F94F,U+1F950-1F95E,U+1F95F-1F96B,U+1F96C-1F970,U+1F971,U+1F973-1F976,U+1F97A,U+1F97B,U+1F97C-1F97F,U+1F980-1F984,U+1F985-1F991,U+1F992-1F997,U+1F998-1F9A2,U+1F9A5-1F9AA,U+1F9AE-1F9AF,U+1F9B0-1F9B9,U+1F9BA-1F9BF,U+1F9C0,U+1F9C1-1F9C2,U+1F9C3-1F9CA,U+1F9CD-1F9CF,U+1F9D0-1F9E6,U+1F9E7-1F9FF,U+1FA70-1FA73,U+1FA78-1FA7A,U+1FA80-1FA82,U+1FA90-1FA95,U+231A-231B,U+23E9-23EC,U+23F0,U+23F3,U+25FD-25FE,U+2614-2615,U+2648-2653,U+267F,U+2693,U+26A1,U+26AA-26AB,U+26BD-26BE,U+26C4-26C5,U+26CE,U+26D4,U+26EA,U+26F2-26F3,U+26F5,U+26FA,U+26FD,U+2705,U+270A-270B,U+2728,U+274C,U+274E,U+2753-2755,U+2757,U+2795-2797,U+27B0,U+27BF,U+2B1B-2B1C,U+2B50,U+2B55,U+1F004,U+1F0CF,U+1F18E,U+1F191-1F19A,U+1F1E6-1F1FF,U+1F201,U+1F21A,U+1F22F,U+1F232-1F236,U+1F238-1F23A,U+1F250-1F251,U+1F300-1F320,U+1F32D-1F32F,U+1F330-1F335,U+1F337-1F37C,U+1F37E-1F37F,U+1F380-1F393,U+1F3A0-1F3C4,U+1F3C5,U+1F3C6-1F3CA,U+1F3CF-1F3D3,U+1F3E0-1F3F0,U+1F3F4,U+1F3F8-1F3FF,U+1F400-1F43E,U+1F440,U+1F442-1F4F7,U+1F4F8,U+1F4F9-1F4FC,U+1F4FF,U+1F500-1F53D,U+1F54B-1F54E,U+1F550-1F567,U+1F57A,U+1F595-1F596,U+1F5A4,U+1F5FB-1F5FF,U+1F600,U+1F601-1F610,U+1F611,U+1F612-1F614,U+1F615,U+1F616,U+1F617,U+1F618,U+1F619,U+1F61A,U+1F61B,U+1F61C-1F61E,U+1F61F,U+1F620-1F625,U+1F626-1F627,U+1F628-1F62B,U+1F62C,U+1F62D,U+1F62E-1F62F,U+1F630-1F633,U+1F634,U+1F635-1F640,U+1F641-1F642,U+1F643-1F644,U+1F645-1F64F,U+1F680-1F6C5,U+1F6CC,U+1F6D0,U+1F6D1-1F6D2,U+1F6D5,U+1F6EB-1F6EC,U+1F6F4-1F6F6,U+1F6F7-1F6F8,U+1F6F9,U+1F6FA,U+1F7E0-1F7EB,U+1F90D-1F90F,U+1F910-1F918,U+1F919-1F91E,U+1F91F,U+1F920-1F927,U+1F928-1F92F,U+1F930,U+1F931-1F932,U+1F933-1F93A,U+1F93C-1F93E,U+1F93F,U+1F940-1F945,U+1F947-1F94B,U+1F94C,U+1F94D-1F94F,U+1F950-1F95E,U+1F95F-1F96B,U+1F96C-1F970,U+1F971,U+1F973-1F976,U+1F97A,U+1F97B,U+1F97C-1F97F,U+1F980-1F984,U+1F985-1F991,U+1F992-1F997,U+1F998-1F9A2,U+1F9A5-1F9AA,U+1F9AE-1F9AF,U+1F9B0-1F9B9,U+1F9BA-1F9BF,U+1F9C0,U+1F9C1-1F9C2,U+1F9C3-1F9CA,U+1F9CD-1F9CF,U+1F9D0-1F9E6,U+1F9E7-1F9FF,U+1FA70-1FA73,U+1FA78-1FA7A,U+1FA80-1FA82,U+1FA90-1FA95,U+1F3FB-1F3FF,U+261D,U+26F9,U+270A-270B,U+270C-270D,U+1F385,U+1F3C2-1F3C4,U+1F3C7,U+1F3CA,U+1F3CB-1F3CC,U+1F442-1F443,U+1F446-1F450,U+1F466-1F478,U+1F47C,U+1F481-1F483,U+1F485-1F487,U+1F48F,U+1F491,U+1F4AA,U+1F574-1F575,U+1F57A,U+1F590,U+1F595-1F596,U+1F645-1F647,U+1F64B-1F64F,U+1F6A3,U+1F6B4-1F6B6,U+1F6C0,U+1F6CC,U+1F90F,U+1F918,U+1F919-1F91E,U+1F91F,U+1F926,U+1F930,U+1F931-1F932,U+1F933-1F939,U+1F93C-1F93E,U+1F9B5-1F9B6,U+1F9B8-1F9B9,U+1F9BB,U+1F9CD-1F9CF,U+1F9D1-1F9DD,U+0023,U+002A,U+0030-0039,U+200D,U+20E3,U+FE0F,U+1F1E6-1F1FF,U+1F3FB-1F3FF,U+1F9B0-1F9B3,U+E0020-E007F,U+00A9,U+00AE,U+203C,U+2049,U+2122,U+2139,U+2194-2199,U+21A9-21AA,U+231A-231B,U+2328,U+2388,U+23CF,U+23E9-23F3,U+23F8-23FA,U+24C2,U+25AA-25AB,U+25B6,U+25C0,U+25FB-25FE,U+2600-2605,U+2607-2612,U+2614-2615,U+2616-2617,U+2618,U+2619,U+261A-266F,U+2670-2671,U+2672-267D,U+267E-267F,U+2680-2685,U+2690-2691,U+2692-269C,U+269D,U+269E-269F,U+26A0-26A1,U+26A2-26B1,U+26B2,U+26B3-26BC,U+26BD-26BF,U+26C0-26C3,U+26C4-26CD,U+26CE,U+26CF-26E1,U+26E2,U+26E3,U+26E4-26E7,U+26E8-26FF,U+2700,U+2701-2704,U+2705,U+2708-2709,U+270A-270B,U+270C-2712,U+2714,U+2716,U+271D,U+2721,U+2728,U+2733-2734,U+2744,U+2747,U+274C,U+274E,U+2753-2755,U+2757,U+2763-2767,U+2795-2797,U+27A1,U+27B0,U+27BF,U+2934-2935,U+2B05-2B07,U+2B1B-2B1C,U+2B50,U+2B55,U+3030,U+303D,U+3297,U+3299,U+1F000-1F02B,U+1F02C-1F02F,U+1F030-1F093,U+1F094-1F09F,U+1F0A0-1F0AE,U+1F0AF-1F0B0,U+1F0B1-1F0BE,U+1F0BF,U+1F0C0,U+1F0C1-1F0CF,U+1F0D0,U+1F0D1-1F0DF,U+1F0E0-1F0F5,U+1F0F6-1F0FF,U+1F10D-1F10F,U+1F12F,U+1F16C,U+1F16D-1F16F,U+1F170-1F171,U+1F17E,U+1F17F,U+1F18E,U+1F191-1F19A,U+1F1AD-1F1E5,U+1F201-1F202,U+1F203-1F20F,U+1F21A,U+1F22F,U+1F232-1F23A,U+1F23C-1F23F,U+1F249-1F24F,U+1F250-1F251,U+1F252-1F25F,U+1F260-1F265,U+1F266-1F2FF,U+1F300-1F320,U+1F321-1F32C,U+1F32D-1F32F,U+1F330-1F335,U+1F336,U+1F337-1F37C,U+1F37D,U+1F37E-1F37F,U+1F380-1F393,U+1F394-1F39F,U+1F3A0-1F3C4,U+1F3C5,U+1F3C6-1F3CA,U+1F3CB-1F3CE,U+1F3CF-1F3D3,U+1F3D4-1F3DF,U+1F3E0-1F3F0,U+1F3F1-1F3F7,U+1F3F8-1F3FA,U+1F400-1F43E,U+1F43F,U+1F440,U+1F441,U+1F442-1F4F7,U+1F4F8,U+1F4F9-1F4FC,U+1F4FD-1F4FE,U+1F4FF,U+1F500-1F53D,U+1F546-1F54A,U+1F54B-1F54F,U+1F550-1F567,U+1F568-1F579,U+1F57A,U+1F57B-1F5A3,U+1F5A4,U+1F5A5-1F5FA,U+1F5FB-1F5FF,U+1F600,U+1F601-1F610,U+1F611,U+1F612-1F614,U+1F615,U+1F616,U+1F617,U+1F618,U+1F619,U+1F61A,U+1F61B,U+1F61C-1F61E,U+1F61F,U+1F620-1F625,U+1F626-1F627,U+1F628-1F62B,U+1F62C,U+1F62D,U+1F62E-1F62F,U+1F630-1F633,U+1F634,U+1F635-1F640,U+1F641-1F642,U+1F643-1F644,U+1F645-1F64F,U+1F680-1F6C5,U+1F6C6-1F6CF,U+1F6D0,U+1F6D1-1F6D2,U+1F6D3-1F6D4,U+1F6D5,U+1F6D6-1F6DF,U+1F6E0-1F6EC,U+1F6ED-1F6EF,U+1F6F0-1F6F3,U+1F6F4-1F6F6,U+1F6F7-1F6F8,U+1F6F9,U+1F6FA,U+1F6FB-1F6FF,U+1F774-1F77F,U+1F7D5-1F7D8,U+1F7D9-1F7DF,U+1F7E0-1F7EB,U+1F7EC-1F7FF,U+1F80C-1F80F,U+1F848-1F84F,U+1F85A-1F85F,U+1F888-1F88F,U+1F8AE-1F8FF,U+1F90C,U+1F90D-1F90F,U+1F910-1F918,U+1F919-1F91E,U+1F91F,U+1F920-1F927,U+1F928-1F92F,U+1F930,U+1F931-1F932,U+1F933-1F93A,U+1F93C-1F93E,U+1F93F,U+1F940-1F945,U+1F947-1F94B,U+1F94C,U+1F94D-1F94F,U+1F950-1F95E,U+1F95F-1F96B,U+1F96C-1F970,U+1F971,U+1F972,U+1F973-1F976,U+1F977-1F979,U+1F97A,U+1F97B,U+1F97C-1F97F,U+1F980-1F984,U+1F985-1F991,U+1F992-1F997,U+1F998-1F9A2,U+1F9A3-1F9A4,U+1F9A5-1F9AA,U+1F9AB-1F9AD,U+1F9AE-1F9AF,U+1F9B0-1F9B9,U+1F9BA-1F9BF,U+1F9C0,U+1F9C1-1F9C2,U+1F9C3-1F9CA,U+1F9CB-1F9CC,U+1F9CD-1F9CF,U+1F9D0-1F9E6,U+1F9E7-1F9FF,U+1FA00-1FA53,U+1FA54-1FA5F,U+1FA60-1FA6D,U+1FA6E-1FA6F,U+1FA70-1FA73,U+1FA74-1FA77,U+1FA78-1FA7A,U+1FA7B-1FA7F,U+1FA80-1FA82,U+1FA83-1FA8F,U+1FA90-1FA95,U+1FA96-1FFFD";

    // TODO: Figure out a better way to do this?
    const font = new FontFace("twemoji", 'url(fonts/TwitterColorEmoji-SVGinOT.woff2)', {
        unicodeRange: emojiUnicodeRange,
    });
    doc.fonts.add(await font.load());
  }

  /**
   * Render the label image sized to a label's dimensions. Note the return widthOffset
   * should be set on the label for proper alignment.
   * @param {number} width - The label width to render the canvas data within.
   * @param {number} height - The label height to render the canvas data within.
   * @param {number} heightPadding - Dots to add to the top of the label as padding.
   * @param {number} widthPadding - Dots to divide btween either side of the label as padding.
   * @returns {*} Tuple with a width offset and the canvas data to render.
   */
  renderToImageSizedToLabel(width, height, widthPadding = 20, heightPadding = 10) {
    // Safety buffer around the edges of the printable area.
    // Make sure the width ends up on an byte boundary!
    const widthRemainder = (label.labelWidthDots - widthPadding) % 8;
    const widthOffset = widthPadding + widthRemainder;
    const canvasData = this.renderToImageData(
      width - widthOffset,
      height - heightPadding);

    return { canvasData, widthOffset: widthOffset / 2 };
  }

  /**
   * Render this label's text onto a canvas, returning the ImageData.
   * @param {number} width - The width of the label.
   * @param {number} height - The height of the label.
   * @param {CanvasRenderingContext2D} canvas - The optional canvas context to re-use.
   * If not supplied an OffscreenCanvas will be used instead.
   * @returns {ImageData} - The ImageData of the canvas with the label's text rendered.
   */
  renderToImageData(width, height, canvas) {
    canvas = canvas || new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Avoid too much antialiasing which the printer can't do anything with.
    ctx.imageSmoothingEnabled = false;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // TODO: Consider a modular system capable of passing this information in more
    // dynamically. Hardcoding is fine for the one-off-single-con work right now.
    const offsets = this.constructor.lineOffsets;
    this.#addLine(ctx, offsets["line1"], width, this.line1);
    this.#addLine(ctx, offsets["line2"], width, this.line2);
    this.#addLine(ctx, offsets["level"], width, this.level);
    this.#addLine(ctx, offsets["minor"], width, this.isMinor ? "MINOR" : "");
    this.#addLine(ctx, offsets["badge"], width, this.badgeId);

    return ctx.getImageData(0, 0, width, height);
  }

  /**
   * Add a text line to a canvas context, within the bounding box offsets.
   * @param {CanvasRenderingContext2D} ctx - The canvas to add the line to.
   * @param {LineOffset} offsets - The offsets and bounding box to place the line.
   * @param {number} maxWidth - The max width of the entire canvas.
   * @param {string} text - The text to add.
   */
  #addLine(ctx, offsets, maxWidth, text) {
    const maxX = offsets.maxWidth !== LineOffset.fullLabelWidth ? offsets.maxWidth : maxWidth;
    const offsetX = offsets.offsetX !== LineOffset.centeredOnLabel ? offsets.offsetX : (maxWidth / 2);

    let size = this.#getMaxFontSizeInPx(ctx, text, maxX, offsets.maxHeight, offsets.isBold);
    ctx.font = this.#getFont(size, offsets.isBold);
    ctx.textAlign = offsets.alignmentPoint;
    ctx.fillText(text, offsetX, offsets.offsetY);
  }

  /**
   * Get a CSS string for a font configuration.
   * @param {number} size - The font size in pixels.
   * @param {string} family - The font family.
   * @param {boolean} isBold - Whether to bold the font.
   * @returns A CSS string for a font property.
   */
  #getFont(size, isBold, family = this.constructor.fontFamily) {
    return `${isBold ? "bold" : ""} ${size}px ${family}`;
  }

  /**
   * Get the maximum font size in px that will fit within a bounding box.
   * @param {CanvasRenderingContext2D} ctx - The canvas context to measure.
   * @param {string} text - The text to measure.
   * @param {number} maxWidth - The max width of the bounding box, in pixels.
   * @param {number} maxHeight - The max height of the bounding box, in pixels.
   * @param {boolean} isBold - Whether the text should be bold.
   * @returns The maximum font size to fit within the bounds of the label, in px.
   */
  #getMaxFontSizeInPx(ctx, text, maxWidth, maxHeight, isBold) {
    // Rendering a font at 1px generates a multiplier to use for sizing.
    // The offset will be dependent on the actual printed characters, so we
    // need the real text that will be printed.
    ctx.font = this.#getFont(1, isBold);
    let fontSize = ctx.measureText(text);
    let fontWidth = maxWidth / fontSize.width;

    // Ascent and Descent are offsets from the 'centerpoint' of a character. Combined
    // they represent the total space taken up by characters in the string.

    // Note that the ascent and descent are calculated based on the character _set_
    // that is used. If you have any lowercase characters it will calculate spacing
    // for a lowercase 'g' even if there isn't one. No lowercase characters = No
    // descenders calculated. This means allcaps is bigger for a given height limit.
    let fontHeight = maxHeight / (fontSize.actualBoundingBoxAscent + fontSize.actualBoundingBoxDescent);
    return Math.min(fontWidth, fontHeight);
  }
}
