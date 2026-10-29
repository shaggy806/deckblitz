import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import { goadersOf } from "../goad.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const offersOf = (game: Game, source: ObjectId, player = A): ActivateOffer[] =>
  game
    .legalActions(player)
    .filter((o): o is ActivateOffer => o.kind === "activate-ability" && o.source === source);

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Garnet, Princess of Alexandria", () => {
  it("removes a lore counter from each Saga chosen and grows by that many", () => {
    const { game, a } = table();
    const garnet = spawn(game, "Garnet, Princess of Alexandria");
    const saga1 = spawn(game, "Armor Wars");
    const saga2 = spawn(game, "Armor Wars");
    game.state.objects[saga1].counters.lore = 1;
    game.state.objects[saga2].counters.lore = 1;
    const theirs = spawn(game, "Armor Wars", B);
    game.state.objects[theirs].counters.lore = 1;
    let offered: readonly ObjectId[] = [];
    a.chooseCounterRemovalsFn = (_view, offer) => {
      offered = offer.eligible.map((e) => e.object);
      return [
        { object: saga1, kind: "lore", count: 1 },
        { object: saga2, kind: "lore", count: 1 },
      ];
    };
    attack(game, a, [garnet]);
    expect([...offered].sort()).toEqual([saga1, saga2].sort());
    expect(counters(game, theirs, "lore")).toBe(1);
    expect(counters(game, saga1, "lore")).toBe(0);
    expect(counters(game, saga2, "lore")).toBe(0);
    expect(counters(game, garnet)).toBe(2);
  });
});

describe("Moxite Refinery", () => {
  it("removes X counters as a cost and puts X +1/+1 counters on the target", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const refinery = spawn(game, "Moxite Refinery");
    const donor = spawn(game, "Grizzly Bears");
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[donor].counters["+1/+1"] = 3;
    a.chooseCounterRemovalsFn = () => [{ object: donor, kind: "+1/+1", count: 2 }];
    activate(game, refinery, 0, { modes: [1], x: 2, targets: [ref(bear)] });
    expect(counters(game, donor)).toBe(1);
    expect(counters(game, bear)).toBe(2);
  });
});

describe("Lord Xander, the Collector", () => {
  it("makes the target opponent discard half their hand, rounded down", () => {
    const { game, a } = table();
    toHand(game, "Wastes", B); // bob: 8 + 1 = 9 cards
    const before = hand(game, B).length;
    pickTargets(a, B);
    enter(game, "Lord Xander, the Collector");
    expect(hand(game, B).length).toBe(before - Math.floor(before / 2));
  });

  it("dies: the target opponent sacrifices half their nonland permanents, rounded down", () => {
    const { game, a } = table();
    const xander = spawn(game, "Lord Xander, the Collector");
    const bobs = [0, 1, 2, 3, 4].map(() => spawn(game, "Grizzly Bears", B));
    lands(game, "Wastes", 3, B);
    pickTargets(a, B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(xander)]);
    settle(game);
    expect(bobs.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === B)).toHaveLength(6);
  });
});

describe("Capital Punishment", () => {
  it("each opponent sacrifices a creature per death vote and discards a card per taxes vote", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 6);
    const bobs = [0, 1, 2].map(() => spawn(game, "Grizzly Bears", B));
    const carols = [0, 1, 2].map(() => spawn(game, "Grizzly Bears", C));
    const mine = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickModes(b, 0);
    pickModes(c, 1);
    const bobHand = hand(game, B).length;
    const carolHand = hand(game, C).length;
    cast(game, toHand(game, "Capital Punishment"));
    expect(bobs.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
    expect(carols.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
    expect(zone(game, mine)).toBe("battlefield");
    expect(hand(game, B).length).toBe(bobHand - 1);
    expect(hand(game, C).length).toBe(carolHand - 1);
  });
});

describe("Kargan Intimidator", () => {
  it("turns a creature into a Coward (only), once a turn per mode, and Cowards can't block Warriors", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const kargan = spawn(game, "Kargan Intimidator");
    const angel = spawn(game, "Serra Angel", B);
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, kargan, 0, { modes: [1], targets: [ref(angel)] });
    expect(subtypes(game, angel)).toEqual(["Coward"]);
    expect(offersOf(game, kargan).map((o) => o.modes)).toEqual([[0], [2]]);
    const offer = blockOffer(game, a, [kargan]);
    const canBlock = (id: ObjectId): readonly ObjectId[] =>
      offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(angel)).not.toContain(kargan);
    expect(canBlock(bear)).toContain(kargan);
  });
});

describe("Malfegor", () => {
  it("discards your hand, and each opponent sacrifices a creature per card discarded", () => {
    const { game } = table();
    const discarded = hand(game, A).length; // 8
    const bobs = Array.from({ length: discarded + 2 }, () => spawn(game, "Grizzly Bears", B));
    enter(game, "Malfegor");
    expect(hand(game, A)).toHaveLength(0);
    expect(bobs.filter((id) => zone(game, id) === "graveyard")).toHaveLength(discarded);
  });
});

describe("Thoughts of Ruin", () => {
  it("each player sacrifices a land for each card in your hand as it resolves", () => {
    const { game } = table();
    const mine = lands(game, "Mountain", 6);
    const bobs = lands(game, "Wastes", 12, B);
    const ruin = toHand(game, "Thoughts of Ruin");
    const held = hand(game, A).length - 1; // the spell leaves the hand
    cast(game, ruin);
    expect(mine.filter((id) => zone(game, id) === "graveyard")).toHaveLength(6); // fewer than 8: all
    expect(bobs.filter((id) => zone(game, id) === "graveyard")).toHaveLength(held);
  });
});

describe("Quarry Colossus", () => {
  it("puts the target creature just beneath the top X cards, X the Plains you control", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    enter(game, "Quarry Colossus");
    expect(zone(game, bear)).toBe("library");
    const lib = library(game, B);
    // Third from the top, whichever end of the array is the top.
    expect([lib.indexOf(bear), lib.length - 1 - lib.indexOf(bear)]).toContain(2);
  });
});

describe("Bow of Nylea", () => {
  it("puts up to four target cards from your graveyard on the bottom of your library", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bow = spawn(game, "Bow of Nylea");
    const cards = [0, 1, 2].map(() => toGraveyard(game, "Grizzly Bears"));
    activate(game, bow, 0, { modes: [3], targets: cards.map((id) => ref(id)) });
    expect(cards.map((id) => zone(game, id))).toEqual(["library", "library", "library"]);
    expect(graveyard(game)).toHaveLength(0);
  });

  it("gives attacking creatures you control deathtouch", () => {
    const { game, a } = table();
    spawn(game, "Bow of Nylea");
    const bear = spawn(game, "Grizzly Bears");
    expect(keywords(game, bear).has("deathtouch")).toBe(false);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(keywords(game, bear).has("deathtouch")).toBe(true);
  });
});

describe("Interdict", () => {
  it("counters the ability, locks its source's activated abilities this turn, and draws", () => {
    const { game, b } = table();
    lands(game, "Island", 2, B);
    lands(game, "Mountain", 3);
    const dragon = spawn(game, "Shivan Dragon");
    const interdict = toHand(game, "Interdict", B);
    const bobHand = hand(game, B).length;
    activate(game, dragon, 0, { settle: false });
    const ability = game.state.zones.shared.stack[0];
    b.enqueue({ type: "cast-spell", player: B, card: interdict, targets: [{ kind: "object", object: ability }] });
    settle(game);
    expect(pt(game, dragon)).toEqual({ power: 5, toughness: 5 });
    expect(offersOf(game, dragon)).toHaveLength(0);
    expect(hand(game, B).length).toBe(bobHand); // Interdict left, a card drawn
  });
});

describe("Viper's Kiss", () => {
  it("gives -1/-1 and stops the enchanted creature's activated abilities", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const dragon = spawn(game, "Shivan Dragon");
    cast(game, toHand(game, "Viper's Kiss"), { targets: [ref(dragon)] });
    expect(pt(game, dragon)).toEqual({ power: 4, toughness: 4 });
    expect(offersOf(game, dragon)).toHaveLength(0);
  });
});

describe("Hovel Hurler", () => {
  it("removes one of its counters to give another creature you control +1/+0 and flying", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const hurler = enter(game, "Hovel Hurler");
    expect(counters(game, hurler, "-1/-1")).toBe(2);
    const bear = spawn(game, "Grizzly Bears");
    activate(game, hurler, 0, { targets: [ref(bear)] });
    expect(counters(game, hurler, "-1/-1")).toBe(1);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bear).has("flying")).toBe(true);
  });
});

describe("Ransom Note", () => {
  it("goads the target creature in its second mode", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const note = spawn(game, "Ransom Note");
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, note, 0, { modes: [1], targets: [ref(bear)] });
    expect(zone(game, note)).toBe("graveyard");
    expect(goadersOf(game.state, game.registry, bear)).toEqual([A]);
  });
});
