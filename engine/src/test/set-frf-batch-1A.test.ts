/**
 * Fate Reforged, group A: the clauses most likely to be wrong — Fascination's
 * modes, the Shaman's count, the Scroll's counters, the General's tapped
 * count, Yasova's power-gated steal, the Avengers' resolution-time compare,
 * the Runemark's colour gate and the Construct's coloured sacrifice.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
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
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const faceDown = (game: Game, player = A): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined && game.state.objects[id].controller === player);

describe("Fascination", () => {
  it("draws X for each player in the first mode", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const card = toHand(game, "Fascination");
    const [handA, handB] = [hand(game, A).length, hand(game, B).length];
    cast(game, card, { x: 2, modes: [0] });
    expect(hand(game, A).length).toBe(handA - 1 + 2);
    expect(hand(game, B).length).toBe(handB + 2);
  });

  it("mills X for each player in the second mode", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const card = toHand(game, "Fascination");
    cast(game, card, { x: 3, modes: [1] });
    expect(graveyard(game, A).length).toBe(3 + 1); // three milled and Fascination itself
    expect(graveyard(game, B).length).toBe(3);
  });
});

describe("Shaman of the Great Hunt", () => {
  it("draws one card per creature you control with power 4 or greater", () => {
    const { game } = table();
    const shaman = spawn(game, "Shaman of the Great Hunt");
    spawn(game, "Craw Wurm");
    spawn(game, "Hill Giant");
    spawn(game, "Craw Wurm", B);
    lands(game, "Forest", 4);
    const before = hand(game, A).length;
    activate(game, shaman);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("puts a +1/+1 counter on a creature of yours that deals combat damage to a player", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Shaman of the Great Hunt");
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Scroll of the Masters", () => {
  it("gets a lore counter per noncreature spell and pumps by the count", () => {
    const { game } = table();
    const scroll = spawn(game, "Scroll of the Masters");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, scroll, "lore")).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, scroll, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Dragonscale General", () => {
  it("bolsters by the number of tapped creatures you control at your end step", () => {
    const { game } = table();
    spawn(game, "Dragonscale General");
    spawn(game, "Hill Giant", A, { tapped: true });
    spawn(game, "Hill Giant", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Yasova Dragonclaw", () => {
  it("offers only opponents' creatures with less power, and steals, untaps and hastes one", () => {
    const { game, a } = table();
    spawn(game, "Yasova Dragonclaw");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const wurm = spawn(game, "Craw Wurm", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant");
    lands(game, "Mountain", 3);
    const seen = watchTargets(a, () => [bears]);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(wurm);
    expect(seen.offered[0]).not.toContain(mine);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Lightning Shrieker", () => {
  it("is shuffled into its owner's library at the end step", () => {
    const { game } = table();
    const shrieker = spawn(game, "Lightning Shrieker");
    toStep(game, "end");
    settle(game);
    expect(zone(game, shrieker)).toBe("library");
  });
});

describe("Hooded Assassin", () => {
  it("destroys a creature dealt damage this turn in its second mode", () => {
    const { game, a } = table();
    const bears = spawn(game, "Craw Wurm", B);
    spawn(game, "Craw Wurm", B); // undamaged: not a legal target
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    pickModes(a, 1);
    pickTargets(a, bears);
    const assassin = enter(game, "Hooded Assassin");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, assassin)).toBe(0);
  });

  it("puts a +1/+1 counter on itself in its first mode", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const assassin = enter(game, "Hooded Assassin");
    expect(counters(game, assassin)).toBe(1);
  });
});

describe("Sage-Eye Avengers", () => {
  it("returns the target only if its power is less than the Avengers'", () => {
    const { game, a } = table();
    const avengers = spawn(game, "Sage-Eye Avengers");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [avengers]);
    expect(zone(game, bears)).toBe("hand");
  });

  it("leaves a creature with greater power", () => {
    const { game, a } = table();
    const avengers = spawn(game, "Sage-Eye Avengers");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    pickModes(a, 0);
    attack(game, a, [avengers]);
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Temur Runemark", () => {
  it("gives +2/+2, and trample only while you control a blue or red permanent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Mountain"); // a land is colourless
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Temur Runemark"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("trample")).toBe(false);
    const goblin = spawn(game, "Raging Goblin");
    expect(keywords(game, bears).has("trample")).toBe(true);
    destroy(game, goblin);
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Ugin's Construct", () => {
  it("sacrifices a coloured permanent, never a colourless one", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    const construct = enter(game, "Ugin's Construct");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, construct)).toBe("battlefield");
  });

  it("sacrifices nothing with only colourless permanents", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    const construct = enter(game, "Ugin's Construct");
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, construct)).toBe("battlefield");
  });
});

describe("Smoldering Efreet", () => {
  it("deals 2 damage to its controller when it dies", () => {
    const { game } = table();
    const efreet = spawn(game, "Smoldering Efreet");
    destroy(game, efreet);
    expect(life(game, A)).toBe(18);
  });
});

describe("Soul Summons", () => {
  it("manifests the top card of your library", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Soul Summons"));
    expect(faceDown(game)).toHaveLength(1);
    expect(pt(game, faceDown(game)[0])).toEqual({ power: 2, toughness: 2 });
  });
});
