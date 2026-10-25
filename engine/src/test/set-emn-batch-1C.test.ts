/**
 * Eldritch Moon, group C: the cards whose behaviour is more than a stat line
 * or a copy of an already-tested shape.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Eldritch Moon — group C", () => {
  it("Noosegraf Mob enters with five counters and trades one for a Zombie whenever a player casts a spell", () => {
    const { game } = table();
    const mob = enter(game, "Noosegraf Mob");
    expect(counters(game, mob)).toBe(5);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, mob)).toBe(4);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("Oath of Liliana makes each opponent sacrifice, and a Zombie only on a turn a planeswalker entered under your control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Oath of Liliana");
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
    toStep(game, "precombat-main");
    enter(game, "Chandra, Flameshaper");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("Bedlam Reveler costs {1} less per instant and sorcery card in your graveyard, then wheels three", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    for (let i = 0; i < 6; i++) toGraveyard(game, "Lightning Bolt");
    const reveler = toHand(game, "Bedlam Reveler");
    const before = hand(game).length;
    cast(game, reveler);
    expect(zone(game, reveler)).toBe("battlefield");
    expect(before).toBeGreaterThan(4);
    expect(hand(game).length).toBe(3);
  });

  it("Grizzled Angler transforms only once a colorless creature card is in your graveyard", () => {
    const { game } = table();
    const angler = spawn(game, "Grizzled Angler");
    activate(game, angler);
    expect(pt(game, angler)).toEqual({ power: 2, toughness: 3 });
    expect(graveyard(game).length).toBe(2);
    game.state.objects[angler].tapped = false;
    toLibrary(game, "Ornithopter");
    activate(game, angler);
    expect(pt(game, angler)).toEqual({ power: 4, toughness: 5 });
  });

  it("Heron's Grace Champion pumps other Humans and gives them lifelink, not itself or non-Humans", () => {
    const { game } = table();
    const human = spawn(game, "Ironclad Slayer");
    const bears = spawn(game, "Grizzly Bears");
    const champion = enter(game, "Heron's Grace Champion");
    expect(pt(game, human)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, human).has("lifelink")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(false);
    expect(pt(game, champion)).toEqual({ power: 3, toughness: 3 });
  });

  it("Clear Shot pumps your creature +1/+1 and it deals its power to the other", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Fogwalker", B);
    cast(game, toHand(game, "Clear Shot"), { targets: [ref(bears), ref(target)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, target)).toBe("graveyard");
  });

  it("Borrowed Grace with both modes costs its escalate and gives +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Borrowed Grace"), { modes: [0, 1] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Borrowed Grace can't take both modes without the escalate mana", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Borrowed Grace"), { modes: [0, 1] })).toThrow();
  });

  it("Spreading Flames divides its 6 damage among creatures", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Geist-Fueled Scarecrow", B);
    cast(game, toHand(game, "Spreading Flames"), { targets: [ref(one), ref(two)], division: [3, 3] });
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("battlefield");
    expect(game.state.objects[two].damageMarked).toBe(3);
  });

  it("Stensia Banquet deals damage equal to your Vampires and draws", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Vampire Nighthawk");
    spawn(game, "Stensia Innkeeper");
    const banquet = toHand(game, "Stensia Banquet");
    const before = hand(game).length;
    cast(game, banquet, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before);
  });

  it("Strange Augmentation gives +1/+1, +3/+3 with delirium", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Strange Augmentation"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Oath of Liliana");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("Geist-Fueled Scarecrow makes your creature spells cost {1} more", () => {
    const { game } = table();
    spawn(game, "Geist-Fueled Scarecrow");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears)).toThrow();
    lands(game, "Forest", 1);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Stensia Innkeeper taps an opponent's land, which stays tapped through its next untap step", () => {
    const { game, a } = table();
    const land = spawn(game, "Mountain", B);
    pickTargets(a, land);
    enter(game, "Stensia Innkeeper");
    expect(game.state.objects[land].tapped).toBe(true);
    toStep(game, "precombat-main", B);
    expect(game.state.objects[land].tapped).toBe(true);
  });

  it("Nebelgast Herald taps a creature when another Spirit enters under your control", () => {
    const { game, a } = table();
    spawn(game, "Nebelgast Herald");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Fogwalker");
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Ironclad Slayer may return an Equipment card from your graveyard", () => {
    const { game, a } = table();
    const sword = toGraveyard(game, "Bonesplitter");
    pickTargets(a, sword);
    pickModes(a, 0);
    enter(game, "Ironclad Slayer");
    expect(zone(game, sword)).toBe("hand");
  });
});
