/**
 * Khans of Tarkir and Commander 2014 (KTK, C14; B157) — group C.
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  registryOf,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Infernal Offering", () => {
  it("each player sacrifices and draws two, then you return a creature card, then they do", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const myCard = toGraveyard(game, "Llanowar Elves");
    const theirCard = toGraveyard(game, "Llanowar Elves", B);
    pickFromZone(a, myCard);
    pickFromZone(b, theirCard);
    const offering = toHand(game, "Infernal Offering");
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    cast(game, offering);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(hand(game, A).length).toBe(handA - 1 + 2);
    expect(hand(game, B).length).toBe(handB + 2);
    expect(zone(game, myCard)).toBe("battlefield");
    expect(zone(game, theirCard)).toBe("battlefield");
    expect(game.state.objects[myCard].controller).toBe(A);
    expect(game.state.objects[theirCard].controller).toBe(B);
  });

  it("a player with no creature sacrifices nothing and draws nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    spawn(game, "Grizzly Bears", B);
    const offering = toHand(game, "Infernal Offering");
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    cast(game, offering);
    expect(hand(game, A).length).toBe(handA - 1);
    expect(hand(game, B).length).toBe(handB + 2);
  });
});

describe("Kheru Lich Lord", () => {
  it("pays {2}{B} to return a random creature with flying, trample and haste, exiled at your end step", () => {
    const { game, a } = table();
    spawn(game, "Kheru Lich Lord");
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(zone(game, bears)).toBe("battlefield");
    const kw = keywords(game, bears);
    expect(kw.has("flying") && kw.has("trample") && kw.has("haste")).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Rite of the Serpent", () => {
  it("makes a Snake only if the destroyed creature had a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Swamp", 12);
    const plain = spawn(game, "Grizzly Bears", B);
    const grown = spawn(game, "Grizzly Bears", B);
    game.state.objects[grown].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Rite of the Serpent"), { targets: [ref(plain)] });
    expect(zone(game, plain)).toBe("graveyard");
    expect(tokensNamed(game, "Snake Token", A)).toBe(0);
    cast(game, toHand(game, "Rite of the Serpent"), { targets: [ref(grown)] });
    expect(zone(game, grown)).toBe("graveyard");
    expect(tokensNamed(game, "Snake Token", A)).toBe(1);
  });
});

describe("Crater's Claws", () => {
  it("deals X, or X plus 2 with a 4-power creature", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Crater's Claws"), { targets: [ref(B)], x: 1 });
    expect(life(game, B)).toBe(19);
    spawn(game, "Abzan Guide");
    cast(game, toHand(game, "Crater's Claws"), { targets: [ref(B)], x: 1 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Howl of the Horde", () => {
  it("with raid, the next instant is copied twice", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    cast(game, toHand(game, "Howl of the Horde"));
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
  });

  it("without raid, it's copied once", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Howl of the Horde"));
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Barrage of Boulders", () => {
  it("with ferocious, creatures can't block — one that enters later too", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const guide = spawn(game, "Abzan Guide");
    const small = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Barrage of Boulders"));
    expect(zone(game, small)).toBe("graveyard");
    const later = spawn(game, "Grizzly Bears", B);
    expect(restrictionsOf(game.state, registryOf(game), later).has("cant-block")).toBe(true);
    expect(restrictionsOf(game.state, registryOf(game), guide).has("cant-block")).toBe(true);
  });
});

describe("Master the Way", () => {
  it("draws, then deals damage equal to the cards in hand", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Master the Way"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - hand(game, A).length);
  });
});

describe("Heart-Piercer Bow", () => {
  it("equipped creature's attack has the Bow deal 1 to a creature the defender controls", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const bow = spawn(game, "Heart-Piercer Bow");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    activate(game, bow, 0, { targets: [ref(bears)] });
    pickTargets(a, elves);
    attack(game, a, [bears]);
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("Molting Snakeskin", () => {
  it("gives +2/+0 and a regeneration ability", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Molting Snakeskin"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    activate(game, bears, 0);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Wingmate Roc", () => {
  it("raid makes a 3/4 Bird; attacking gains life per attacker", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    const roc = enter(game, "Wingmate Roc");
    expect(tokensNamed(game, "Bird Token (White 3/4)", A)).toBe(1);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [roc, bears]);
    expect(life(game, A)).toBe(22);
  });
});

describe("Demon of Wailing Agonies", () => {
  it("lieutenant: +2/+2 and combat damage to a player makes them sacrifice a creature", () => {
    const { game, a } = table();
    const demon = spawn(game, "Demon of Wailing Agonies");
    expect(pt(game, demon)).toEqual({ power: 4, toughness: 4 });
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    expect(pt(game, demon)).toEqual({ power: 6, toughness: 6 });
    const elves = spawn(game, "Llanowar Elves", B);
    attack(game, a, [demon]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, elves)).toBe("graveyard");
  });
});
