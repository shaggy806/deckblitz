/**
 * Worldwake (WWK; B162), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Terra Eternal", () => {
  it("gives every player's lands indestructible", () => {
    const { game } = table();
    spawn(game, "Terra Eternal");
    const theirs = spawn(game, "Wastes", B);
    destroy(game, theirs);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(keywords(game, theirs).has("indestructible")).toBe(true);
  });
});

describe("Jwari Shapeshifter", () => {
  it("enters as a copy of an Ally creature, whose enters trigger fires", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Ondu Cleric", B);
    lands(game, "Island", 2);
    const jwari = toHand(game, "Jwari Shapeshifter");
    cast(game, jwari);
    expect(zone(game, jwari)).toBe("battlefield");
    expect(pt(game, jwari)).toEqual({ power: 1, toughness: 1 });
    expect(life(game, A)).toBe(21);
  });

  it("can't copy a non-Ally, so it enters as a 0/0", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    const jwari = toHand(game, "Jwari Shapeshifter");
    cast(game, jwari);
    expect(zone(game, jwari)).toBe("graveyard");
  });
});

describe("Talus Paladin", () => {
  it("asks the two choices separately", () => {
    const { game, a } = table();
    const answers: number[][] = [[], [0]];
    a.chooseModesFn = () => answers.shift() ?? [];
    const paladin = enter(game, "Talus Paladin");
    expect(keywords(game, paladin).has("lifelink")).toBe(false);
    expect(counters(game, paladin)).toBe(1);
  });
});

describe("Ruin Ghost", () => {
  it("blinks a land you control, which returns untapped", () => {
    const { game } = table();
    const ghost = spawn(game, "Ruin Ghost");
    spawn(game, "Plains");
    const tapped = spawn(game, "Wastes", A, { tapped: true });
    activate(game, ghost, 0, { targets: [ref(tapped)] });
    const wastes = named(game, "Wastes", A);
    expect(wastes.length).toBe(1);
    expect(game.state.objects[wastes[0]].tapped).toBe(false);
  });
});

describe("Cosi's Ravager", () => {
  it("may deal 1 damage to a target player on landfall", () => {
    const { game, a } = table();
    spawn(game, "Cosi's Ravager");
    pickModes(a, 0);
    pickTargets(a, B);
    enter(game, "Wastes");
    expect(life(game, B)).toBe(19);
  });
});

describe("Akoum Battlesinger", () => {
  it("pumps only Ally creatures, power only", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const bears = spawn(game, "Grizzly Bears");
    const singer = enter(game, "Akoum Battlesinger");
    expect(pt(game, singer)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Bestial Menace", () => {
  it("creates a Snake, a Wolf and an Elephant", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Bestial Menace"));
    expect(tokensNamed(game, "Snake Token", A)).toBe(1);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
    expect(tokensNamed(game, "Elephant Token", A)).toBe(1);
  });
});

describe("Aether Tradewinds", () => {
  it("returns a permanent you control and one you don't", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Aether Tradewinds"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
    expect(hand(game, B)).toContain(theirs);
  });
});

describe("Join the Ranks", () => {
  it("makes two Soldier Allies, each an Ally entering", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const brigand = spawn(game, "Bojuka Brigand");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Join the Ranks"));
    expect(tokensNamed(game, "Soldier Ally Token", A)).toBe(2);
    expect(counters(game, brigand)).toBe(2);
  });
});

describe("Gnarlid Pack", () => {
  it("enters with a counter per kick", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const card = toHand(game, "Gnarlid Pack");
    cast(game, card, { kicked: true, kickCount: 2 });
    expect(pt(game, card)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Enclave Elite", () => {
  it("unkicked, enters with no counters", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const card = toHand(game, "Enclave Elite");
    cast(game, card);
    expect(pt(game, card)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kor Firewalker", () => {
  it("may gain 1 life when any player casts a red spell", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Kor Firewalker");
    lands(game, "Mountain", 1, B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(21);
  });
});

describe("Tomb Hex", () => {
  it("gives -2/-2 without landfall", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Tomb Hex"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });

  it("gives -4/-4 if a land entered under your control this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    enter(game, "Wastes");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Tomb Hex"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});
