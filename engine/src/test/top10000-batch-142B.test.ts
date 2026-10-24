/**
 * Batch 142, group B: the cards whose behaviour is more than a stat line —
 * each test pins the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
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
  registryOf,
  settle,
  spawn,
  table,
  tokensNamed,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const manaOf = (game: Game, type: string, player: PlayerId = A): number =>
  game.state.players[player].manaPool.filter((u) => u.type === type).length;
const addCounter = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);

describe("Hex", () => {
  it("can't be cast with fewer than six targets, and destroys all six", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = Array.from({ length: 6 }, () => spawn(game, "Grizzly Bears", B));
    const hex = toHand(game, "Hex");
    expect(() => cast(game, hex, { targets: bears.slice(0, 5).map(ref) })).toThrow();
    cast(game, hex, { targets: bears.map(ref) });
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
  });
});

describe("Intellectual Offering", () => {
  it("both players draw three, and both untap their nonland permanents but not lands", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const theirLand = spawn(game, "Forest", B, { tapped: true });
    const offering = toHand(game, "Intellectual Offering");
    const before = { a: hand(game, A).length - 1, b: hand(game, B).length };
    cast(game, offering);
    expect(hand(game, A).length).toBe(before.a + 3);
    expect(hand(game, B).length).toBe(before.b + 3);
    expect(game.state.objects[mine].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(game.state.objects[theirLand].tapped).toBe(true);
  });
});

describe("Temur Charm", () => {
  it("the third mode binds a small creature that enters later, not a big one", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Temur Charm"), { modes: [2] });
    const bears = spawn(game, "Grizzly Bears", B);
    expect(restrictionsOf(game.state, registryOf(game), bears).has("cant-block")).toBe(true);
    expect(restrictionsOf(game.state, registryOf(game), wurm).has("cant-block")).toBe(false);
  });

  it("the first mode pumps and fights", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const mine = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    // A 3/3 after the pump: it and the Hill Giant trade.
    cast(game, toHand(game, "Temur Charm"), { modes: [0], targets: [ref(mine), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Phage the Untouchable", () => {
  it("put onto the battlefield without being cast, it loses you the game", () => {
    const { game } = table();
    enter(game, "Phage the Untouchable");
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("cast from your hand, it doesn't", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Phage the Untouchable"));
    expect(named(game, "Phage the Untouchable")).toHaveLength(1);
    expect(game.state.players[A].hasLost).toBeFalsy();
  });
});

describe("Broodhatch Nantuko", () => {
  it("makes as many Insects as the damage dealt to it", () => {
    const { game, a } = table();
    const nantuko = spawn(game, "Broodhatch Nantuko");
    pickModes(a, 0);
    // Lethal, but it still sees all three damage.
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(nantuko)]);
    settle(game);
    expect(zone(game, nantuko)).toBe("graveyard");
    expect(tokensNamed(game, "Insect Token", A)).toBe(3);
  });
});

describe("Baxter, Fly in the Ointment", () => {
  it("only the creatures with a counter on them gain flying as it enters", () => {
    const { game } = table();
    const countered = spawn(game, "Grizzly Bears");
    addCounter(game, countered);
    const plain = spawn(game, "Grizzly Bears");
    enter(game, "Baxter, Fly in the Ointment");
    expect(keywords(game, countered).has("flying")).toBe(true);
    expect(keywords(game, plain).has("flying")).toBe(false);
  });
});

describe("Sea Gate Loremaster", () => {
  it("draws one card per Ally you control", () => {
    const { game } = table();
    const loremaster = spawn(game, "Sea Gate Loremaster");
    spawn(game, "Ondu Cleric");
    spawn(game, "Ondu Cleric", B);
    const before = hand(game, A).length;
    activate(game, loremaster);
    expect(hand(game, A).length).toBe(before + 2);
  });
});

describe("Ondu Cleric", () => {
  it("triggers on its own entry and on another Ally's, counting Allies as it resolves", () => {
    const { game, a } = table();
    pickModes(a, 0);
    enter(game, "Ondu Cleric");
    expect(life(game, A)).toBe(21);
    enter(game, "Sea Gate Loremaster");
    expect(life(game, A)).toBe(23);
    enter(game, "Grizzly Bears");
    expect(life(game, A)).toBe(23);
  });
});

describe("Gruul Ragebeast", () => {
  it("it fights as it enters, and so does another creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    const beast = enter(game, "Gruul Ragebeast");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[beast].damageMarked).toBe(2);
    pickTargets(a, giant);
    const wurm = enter(game, "Craw Wurm");
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });
});

describe("Court Street Denizen", () => {
  it("taps an opponent's creature when another white creature enters, not a green one", () => {
    const { game, a } = table();
    spawn(game, "Court Street Denizen");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Grizzly Bears");
    expect(game.state.objects[bears].tapped).toBe(false);
    enter(game, "Savannah Lions");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Might of the Masses", () => {
  it("gives +1/+1 for each creature you control, counted as it resolves", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Might of the Masses"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Soulbright Flamekin", () => {
  it("the third resolution this turn may add eight red mana", () => {
    const { game, a } = table();
    const flamekin = spawn(game, "Soulbright Flamekin");
    lands(game, "Mountain", 6);
    pickModes(a, 0);
    activate(game, flamekin, 0, { targets: [ref(flamekin)] });
    activate(game, flamekin, 0, { targets: [ref(flamekin)] });
    expect(manaOf(game, "R")).toBe(0);
    activate(game, flamekin, 0, { targets: [ref(flamekin)] });
    expect(manaOf(game, "R")).toBe(8);
    expect(keywords(game, flamekin).has("trample")).toBe(true);
  });
});

describe("Future Sight", () => {
  it("casts a spell off the top of the library", () => {
    const { game } = table();
    spawn(game, "Future Sight");
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, bears, { via: "library-top" });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Quest for the Goblin Lord", () => {
  it("counts Goblins entering, and at five counters creatures get +2/+0", () => {
    const { game, a } = table();
    const quest = spawn(game, "Quest for the Goblin Lord");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    for (let i = 0; i < 4; i += 1) enter(game, "Raging Goblin");
    enter(game, "Grizzly Bears");
    expect(counters(game, quest, "quest")).toBe(4);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Raging Goblin");
    expect(counters(game, quest, "quest")).toBe(5);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});
