/**
 * Tempest (TMP) — group D of the oldest-first set walk (B178).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  hand,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Twitch", () => {
  it("untaps the target, then draws a card", () => {
    const { game, a } = table();
    const land = spawn(game, "Wastes", A, { tapped: true });
    lands(game, "Island", 3);
    const twitch = toHand(game, "Twitch");
    const before = hand(game).length;
    pickModes(a, 1);
    cast(game, twitch, { targets: [ref(land)] });
    expect(game.state.objects[land].tapped).toBe(false);
    expect(hand(game).length).toBe(before); // Twitch left, one card drawn
  });
});

describe("Cinder Marsh", () => {
  it("adds coloured mana without the stack and stays tapped through the next untap step", () => {
    const { game } = table();
    const marsh = spawn(game, "Cinder Marsh");
    activate(game, marsh, 1, { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(game.state.objects[marsh].tapped).toBe(true);
    toStep(game, "precombat-main", A);
    expect(game.state.objects[marsh].tapped).toBe(true);
    toStep(game, "precombat-main", A);
    expect(game.state.objects[marsh].tapped).toBe(false);
  });
});

describe("Extinction", () => {
  it("destroys every creature of the chosen type, both sides, and nothing else", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const elf = spawn(game, "Llanowar Elves", B);
    lands(game, "Swamp", 5);
    a.chooseCreatureTypeFn = () => "Bear";
    cast(game, toHand(game, "Extinction"));
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, elf)).toBe("battlefield");
  });
});

describe("Chill", () => {
  it("makes a red spell cost {2} more", () => {
    const { game } = table();
    spawn(game, "Chill");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    const bolt = toHand(game, "Lightning Bolt");
    expect(() => cast(game, bolt, { targets: [ref(bear)] })).toThrow();
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("Broken Fall", () => {
  it("returns itself to hand to give a regeneration shield", () => {
    const { game } = table();
    const fall = spawn(game, "Broken Fall");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, fall, 0, { targets: [ref(bears)] });
    expect(zone(game, fall)).toBe("hand");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Stalking Stones", () => {
  it("becomes a 3/3 Elemental artifact creature land", () => {
    const { game } = table();
    const stones = spawn(game, "Stalking Stones");
    lands(game, "Wastes", 6);
    activate(game, stones, 1);
    expect(types(game, stones)).toEqual(expect.arrayContaining(["land", "artifact", "creature"]));
    expect(subtypes(game, stones)).toContain("Elemental");
    expect(pt(game, stones)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Aftershock", () => {
  it("destroys the target and deals 3 damage to its caster", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Aftershock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(17);
  });
});
