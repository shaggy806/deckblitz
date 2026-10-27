/**
 * Odyssey (ODY; B225), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Wild Mongrel", () => {
  it("discarding gives +1/+1 and the chosen colour until end of turn", () => {
    const { game, a } = table();
    const dog = spawn(game, "Wild Mongrel");
    const card = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [card];
    pickModes(a, 1);
    activate(game, dog);
    expect(zone(game, card)).toBe("graveyard");
    expect(pt(game, dog)).toEqual({ power: 3, toughness: 3 });
    expect([...computeCharacteristics(game.state, registryOf(game), dog).colors]).toEqual(["U"]);
  });
});

describe("Tireless Tribe", () => {
  it("discarding gives +0/+4", () => {
    const { game, a } = table();
    const tribe = spawn(game, "Tireless Tribe");
    const card = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [card];
    activate(game, tribe);
    expect(pt(game, tribe)).toEqual({ power: 1, toughness: 5 });
  });
});

describe("Phantatog", () => {
  it("each of its two costs gives +1/+1", () => {
    const { game, a } = table();
    const tog = spawn(game, "Phantatog");
    const card = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [card];
    activate(game, tog, 1);
    expect(pt(game, tog)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Spark Mage", () => {
  it("combat damage to a player lets it deal 1 damage to a creature that player controls", () => {
    const { game, a } = table();
    const mage = spawn(game, "Spark Mage");
    const elf = spawn(game, "Llanowar Elves", B);
    pickTargets(a, elf);
    pickModes(a, 0);
    attack(game, a, [mage]);
    expect(life(game, B)).toBe(19);
    expect(zone(game, elf)).toBe("graveyard");
  });
});

describe("Epicenter", () => {
  it("without threshold, only the target player sacrifices one land", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    lands(game, "Forest", 3, B);
    cast(game, toHand(game, "Epicenter"), { targets: [ref(B)] });
    expect(named(game, "Forest", B).length).toBe(2);
    expect(named(game, "Mountain", A).length).toBe(5);
  });

  it("with threshold, each player sacrifices all their lands", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    lands(game, "Forest", 3, B);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Epicenter"), { targets: [ref(B)] });
    expect(named(game, "Forest", B).length).toBe(0);
    expect(named(game, "Mountain", A).length).toBe(0);
  });
});

describe("Cephalid Broker", () => {
  it("the target player draws two, then discards two", () => {
    const { game } = table();
    const broker = spawn(game, "Cephalid Broker");
    const before = hand(game, B).length;
    const gyBefore = graveyard(game, B).length;
    activate(game, broker, 0, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before);
    expect(graveyard(game, B).length).toBe(gyBefore + 2);
  });
});

describe("Volcanic Spray", () => {
  it("1 damage to each non-flier and each player", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const elf = spawn(game, "Llanowar Elves", B);
    const bird = spawn(game, "Birds of Paradise", B);
    cast(game, toHand(game, "Volcanic Spray"));
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, bird)).toBe("battlefield");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Krosan Beast", () => {
  it("is 8/8 with threshold", () => {
    const { game } = table();
    const beast = spawn(game, "Krosan Beast");
    expect(pt(game, beast)).toEqual({ power: 1, toughness: 1 });
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    expect(pt(game, beast)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Seton's Desire", () => {
  it("forces blocks only with threshold", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Seton's Desire"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = game.legalActions(B).find((x) => x.kind === "declare-blockers");
    expect(offer?.kind === "declare-blockers" ? offer.mustBlock : []).toEqual([bears]);
  });

  it("without threshold, nothing must block", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Seton's Desire"), { targets: [ref(bears)] });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = game.legalActions(B).find((x) => x.kind === "declare-blockers");
    expect(offer?.kind === "declare-blockers" ? (offer.mustBlock ?? []) : ["none"]).toEqual([]);
  });
});

describe("Mossfire Egg", () => {
  it("uses the stack, adds {R}{G} and draws a card", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const egg = spawn(game, "Mossfire Egg");
    const before = hand(game).length;
    activate(game, egg, 0, { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, egg)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    const pool = game.state.players[A].manaPool.map((u) => u.type).sort();
    expect(pool).toEqual(["G", "R"]);
  });
});

describe("Cease-Fire", () => {
  it("the target player can't cast creature spells, but can cast others; you draw", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const before = hand(game).length;
    const fire = toHand(game, "Cease-Fire");
    cast(game, fire, { targets: [ref(A)] });
    expect(hand(game).length).toBe(before + 1);
    lands(game, "Forest", 2);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
    const growth = toHand(game, "Giant Growth");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, growth, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Zoologist", () => {
  it("puts a revealed creature onto the battlefield, anything else into the graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const zoo = spawn(game, "Zoologist");
    const bears = toLibrary(game, "Grizzly Bears");
    activate(game, zoo);
    expect(zone(game, bears)).toBe("battlefield");
    game.state.objects[zoo].tapped = false;
    const top = toLibrary(game, "Forest");
    activate(game, zoo);
    expect(zone(game, top)).toBe("graveyard");
  });
});
