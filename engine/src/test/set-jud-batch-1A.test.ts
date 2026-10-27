/**
 * Judgment (JUD; B217), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Phantom Flock", () => {
  it("prevents damage to it and loses one +1/+1 counter per damage event", () => {
    const { game } = table();
    const flock = enter(game, "Phantom Flock");
    expect(counters(game, flock)).toBe(3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(flock)] });
    expect(zone(game, flock)).toBe("battlefield");
    expect(counters(game, flock)).toBe(2);
    expect(game.state.objects[flock].damageMarked).toBe(0);
    expect(pt(game, flock)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Trained Pronghorn", () => {
  it("discards a card to prevent all damage to it this turn", () => {
    const { game } = table();
    const pronghorn = spawn(game, "Trained Pronghorn");
    const before = hand(game).length;
    activate(game, pronghorn);
    expect(hand(game).length).toBe(before - 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(pronghorn)] });
    expect(zone(game, pronghorn)).toBe("battlefield");
  });
});

describe("Cephalid Inkshrouder", () => {
  it("discards a card to gain shroud and become unblockable this turn", () => {
    const { game } = table();
    const octopus = spawn(game, "Cephalid Inkshrouder");
    const before = hand(game).length;
    activate(game, octopus);
    expect(hand(game).length).toBe(before - 1);
    expect(keywords(game, octopus).has("shroud")).toBe(true);
    expect(keywords(game, octopus).has("unblockable")).toBe(true);
  });
});

describe("Funeral Pyre", () => {
  it("exiles a card from an opponent's graveyard and gives its owner the Spirit", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Funeral Pyre"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token", B)).toBe(1);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
  });
});

describe("Cagemail", () => {
  it("gives +2/+2 to the enchanted creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Cagemail"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Treacherous Vampire", () => {
  it("is sacrificed when it attacks with an empty graveyard", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Treacherous Vampire");
    attack(game, a, [vampire]);
    expect(zone(game, vampire)).toBe("graveyard");
  });

  it("stays when you exile a card from your graveyard", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Treacherous Vampire");
    const card = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, card);
    attack(game, a, [vampire]);
    expect(zone(game, vampire)).toBe("battlefield");
    expect(zone(game, card)).toBe("exile");
    expect(life(game, B)).toBe(16);
  });

  it("with threshold is 6/6 and costs you 6 life when it dies", () => {
    const { game } = table();
    const vampire = spawn(game, "Treacherous Vampire");
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    expect(graveyard(game).length).toBe(7);
    expect(pt(game, vampire)).toEqual({ power: 6, toughness: 6 });
    destroy(game, vampire);
    expect(life(game)).toBe(14);
  });
});
