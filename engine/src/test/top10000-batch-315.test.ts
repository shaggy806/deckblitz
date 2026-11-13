// Batch 315: the top 5000's next ten (EDHREC 3479–3698), each on the feature
// it needed.

import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  C,
  activate,
  enter,
  pickFromZone,
  pickTargets,
  cast,
  graveyard,
  hand,
  lands,
  life,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  zone,
} from "./harness.js";

const castAt = (game: Game, seat: ScriptedController, card: ObjectId, player: PlayerId, target: ObjectId): void => {
  seat.enqueue({ type: "cast-spell", player, card, targets: [{ kind: "object", object: target }] });
  settle(game);
};

describe("Spider-Punk: spells and abilities can't be countered", () => {
  it("an ability countered by Tale's End still resolves", () => {
    const { game, b } = table();
    spawn(game, "Spider-Punk", B);
    lands(game, "Wastes", 3);
    const rod = spawn(game, "Rod of Ruin");
    activate(game, rod, 0, { targets: [ref(B)], settle: false });
    const ability = game.state.zones.shared.stack[0];
    lands(game, "Island", 2, B);
    castAt(game, b, toHand(game, "Tale's End", B), B, ability);
    expect(life(game, B)).toBe(19);
  });

  it("an opponent's spell isn't countered either", () => {
    const { game, b } = table();
    spawn(game, "Spider-Punk", B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    lands(game, "Island", 2, B);
    castAt(game, b, toHand(game, "Counterspell", B), B, bolt);
    expect(life(game, B)).toBe(17);
  });
});

describe("Thryx, the Sudden Storm: mana value counts X", () => {
  it("Hangarback Walker cast for X=3 (mana value 6) costs {1} less", () => {
    const { game } = table();
    spawn(game, "Thryx, the Sudden Storm");
    lands(game, "Wastes", 5);
    const walker = toHand(game, "Hangarback Walker");
    cast(game, walker, { x: 3 });
    expect(zone(game, walker)).toBe("battlefield");
  });

  it("isn't reduced at X=2 (mana value 4)", () => {
    const { game } = table();
    spawn(game, "Thryx, the Sudden Storm");
    lands(game, "Wastes", 3);
    const walker = toHand(game, "Hangarback Walker");
    expect(() => cast(game, walker, { x: 2 })).toThrow(/refused/);
  });
});

describe("Burning Inquiry: every player's random discards at once", () => {
  it("each draws three, each picks three at random, then all are discarded together", () => {
    const { game } = table();
    const inquiry = toHand(game, "Burning Inquiry");
    lands(game, "Mountain", 1);
    const before = { a: hand(game, A).length - 1, b: hand(game, B).length };
    const from = game.state.eventLog.length;
    cast(game, inquiry);
    expect(hand(game, A)).toHaveLength(before.a);
    expect(hand(game, B)).toHaveLength(before.b);
    expect(graveyard(game, B)).toHaveLength(3);
    const log = game.state.eventLog.slice(from);
    const picks = log.flatMap((e, i) => (e.type === "acted-at-random" && e.act === "discard" ? [i] : []));
    const discards = log.flatMap((e, i) => (e.type === "cards-discarded" ? [i] : []));
    expect(picks).toHaveLength(2);
    expect(discards).toHaveLength(2);
    expect(Math.max(...picks)).toBeLessThan(Math.min(...discards));
  });
});

describe("Leyline of Transformation: begun on the battlefield, it still chooses", () => {
  it("asks for a creature type before turn 1, and cards in hand are that type", () => {
    const cards = [
      "Leyline of Transformation",
      ...Array.from({ length: 39 }, (_, i) => (i % 2 === 0 ? "Forest" : "Grizzly Bears")),
    ];
    const game = Game.create({
      seed: 7,
      shuffle: false,
      decks: [
        { player: A, cards },
        { player: asPlayerId("bob"), cards: Array<string>(40).fill("Forest") },
      ],
    });
    const leyline = game.handOf(A).find((id) => game.state.objects[id].cardName === "Leyline of Transformation")!;
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [leyline] });
    expect(game.state.awaiting?.kind).toBe("choose-creature-type");
    expect(game.state.objects[leyline].zone).toBe("hand");
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "Elf" });
    expect(game.state.objects[leyline].zone).toBe("battlefield");
    expect(game.state.objects[leyline].chosenCreatureType).toBe("Elf");
    const bears = game.handOf(A).find((id) => game.state.objects[id].cardName === "Grizzly Bears")!;
    expect(subtypes(game, bears)).toContain("Elf");
    expect(subtypes(game, bears)).toContain("Bear");
  });
});

describe("Final Act: each opponent loses all counters", () => {
  it("removes every kind, energy too, and leaves the caster's", () => {
    const { game } = table();
    for (const p of [A, B]) {
      game.state.players[p].counters = { poison: 3, experience: 2 };
      game.state.players[p].energy = 4;
    }
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Final Act"), { modes: [4] });
    expect(game.state.players[B].energy).toBe(0);
    expect(game.state.players[B].counters.poison ?? 0).toBe(0);
    expect(game.state.players[B].counters.experience ?? 0).toBe(0);
    expect(game.state.players[A].energy).toBe(4);
    expect(game.state.players[A].counters.poison).toBe(3);
  });
});

describe("Jeweled Amulet: notes the type of mana spent", () => {
  it("makes one mana of the type that paid its charge ability", () => {
    const { game } = table();
    const amulet = spawn(game, "Jeweled Amulet");
    spawn(game, "Island");
    activate(game, amulet, 0);
    expect(game.state.objects[amulet].counters.charge).toBe(1);
    game.state.objects[amulet].tapped = false;
    activate(game, amulet, 1);
    expect(game.state.players[A].manaPool.map((unit) => unit.type)).toEqual(["U"]);
    expect(game.state.objects[amulet].counters.charge ?? 0).toBe(0);
  });

  it("can't charge while it has a charge counter", () => {
    const { game } = table();
    const amulet = spawn(game, "Jeweled Amulet");
    game.state.objects[amulet].counters.charge = 1;
    spawn(game, "Island");
    expect(() => activate(game, amulet, 0)).toThrow(/refused/);
  });
});

describe("Riptide Gearhulk: third from the top", () => {
  it("puts each opponent's permanent third from the top of its owner's library", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Riptide Gearhulk");
    expect(game.state.zones.perPlayer[B].library.indexOf(bears)).toBe(2);
  });

  it("two cards of one owner go there together, in the order their owner picks", () => {
    const { game, a, c } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", C);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(giant)]);
    const bears = spawn(game, "Grizzly Bears", C);
    pickTargets(a, giant, bears);
    pickFromZone(c, bears, giant);
    enter(game, "Riptide Gearhulk");
    const library = game.state.zones.perPlayer[C].library;
    expect(library.indexOf(bears)).toBe(2);
    expect(library.indexOf(giant)).toBe(3);
  });
});

describe("Sower of Discord: two chosen players", () => {
  it("asks for a second, different player, and damage to either makes the other lose that much", () => {
    const { game, a } = table({ players: 3 });
    const asked: (readonly string[])[] = [];
    const picks = [B, C];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked.push(options);
      return picks[asked.length - 1];
    };
    lands(game, "Swamp", 6);
    const sower = toHand(game, "Sower of Discord");
    cast(game, sower);
    expect(asked).toHaveLength(2);
    expect(asked[1]).not.toContain(B);
    expect(asked[1]).toContain(A);
    expect(game.state.objects[sower].chosenPlayer).toBe(B);
    expect(game.state.objects[sower].otherChosenPlayer).toBe(C);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    expect(life(game, A)).toBe(20);
    // Damage to a player who wasn't chosen does nothing.
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
  });

  it("in a two-player game the second is the other player, unasked", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked += 1;
      return options.includes(A) ? A : options[0];
    };
    lands(game, "Swamp", 6);
    const sower = toHand(game, "Sower of Discord");
    cast(game, sower);
    expect(asked).toBe(1);
    expect(game.state.objects[sower].chosenPlayer).toBe(A);
    expect(game.state.objects[sower].otherChosenPlayer).toBe(B);
  });
});
