/**
 * Magic 2013 (M13) and Avacyn Restored (AVR), group A. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Vexing Devil", () => {
  it("an opponent who accepts takes 4 and the Devil is sacrificed; one who declines takes nothing", () => {
    const { game, b, c } = table({ players: 3 });
    pickModes(b, 0);
    pickModes(c);
    const devil = enter(game, "Vexing Devil");
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(20);
    expect(zone(game, devil)).toBe("graveyard");
  });

  it("stays when every opponent declines", () => {
    const { game, b } = table();
    pickModes(b);
    const devil = enter(game, "Vexing Devil");
    expect(life(game, B)).toBe(20);
    expect(zone(game, devil)).toBe("battlefield");
  });
});

describe("Timberpack Wolf", () => {
  it("gets +1/+1 for each other Timberpack Wolf you control, not an opponent's", () => {
    const { game } = table();
    const wolf = spawn(game, "Timberpack Wolf");
    expect(pt(game, wolf)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Timberpack Wolf");
    spawn(game, "Timberpack Wolf", B);
    expect(pt(game, wolf)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Crusader of Odric", () => {
  it("counts the creatures you control, itself included", () => {
    const { game } = table();
    const crusader = spawn(game, "Crusader of Odric");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, crusader)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Tibalt, the Fiend-Blooded", () => {
  it("−4 deals damage equal to the target player's hand size", () => {
    const { game } = table();
    const tibalt = spawn(game, "Tibalt, the Fiend-Blooded");
    const bobHand = hand(game, B).length;
    loyalty(game, tibalt, -4, { atLeast: 4, targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - bobHand);
  });

  it("+1 draws a card then discards one at random", () => {
    const { game } = table();
    const tibalt = spawn(game, "Tibalt, the Fiend-Blooded");
    const before = hand(game, A).length;
    loyalty(game, tibalt, 1);
    expect(hand(game, A).length).toBe(before);
    expect(counters(game, tibalt, "loyalty")).toBe(3);
  });
});

describe("Nefarox, Overlord of Grixis", () => {
  it("attacking alone, it gets exalted and the defending player sacrifices a creature", () => {
    const { game, a } = table();
    const nefarox = spawn(game, "Nefarox, Overlord of Grixis");
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, a, [nefarox]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, nefarox)).toEqual({ power: 6, toughness: 6 });
    expect(life(game, B)).toBe(14);
  });
});

describe("Hellion Crucible", () => {
  it("with two pressure counters, makes a 4/4 Hellion with haste", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const crucible = spawn(game, "Hellion Crucible");
    game.state.objects[crucible].counters.pressure = 2;
    activate(game, crucible, 2);
    expect(zone(game, crucible)).toBe("graveyard");
    expect(tokensNamed(game, "Hellion Token (Haste)", A)).toBe(1);
  });
});

describe("Defy Death", () => {
  it("returns an Angel with two +1/+1 counters, another creature with none", () => {
    const { game } = table();
    lands(game, "Plains", 10);
    const angel = toGraveyard(game, "Serra Angel");
    cast(game, toHand(game, "Defy Death"), { targets: [ref(angel)] });
    const returned = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Serra Angel")!;
    expect(counters(game, returned)).toBe(2);

    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Defy Death"), { targets: [ref(bears)] });
    const bear = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears")!;
    expect(counters(game, bear)).toBe(0);
  });
});

describe("Veilborn Ghoul", () => {
  it("returns from the graveyard to hand when a Swamp enters under your control", () => {
    const { game, a } = table();
    const ghoul = toGraveyard(game, "Veilborn Ghoul");
    pickModes(a, 0);
    enter(game, "Forest");
    expect(zone(game, ghoul)).toBe("graveyard");
    enter(game, "Swamp");
    expect(zone(game, ghoul)).toBe("hand");
  });
});

describe("Lunar Mystic", () => {
  it("paying {1} on an instant cast draws a card", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Lunar Mystic");
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game, A).length;
    pickModes(a, 0);
    pickTargets(a, B);
    cast(game, bolt, { targets: [ref(B)] });
    expect(hand(game, A).length).toBe(before);
    expect(life(game, B)).toBe(17);
  });
});

describe("Harbor Bandit", () => {
  it("is 3/3 with an Island and can be made unblockable", () => {
    const { game } = table();
    const bandit = spawn(game, "Harbor Bandit");
    expect(pt(game, bandit)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Island", 2);
    expect(pt(game, bandit)).toEqual({ power: 3, toughness: 3 });
    activate(game, bandit, 0);
    expect(keywords(game, bandit).has("unblockable")).toBe(true);
  });
});
