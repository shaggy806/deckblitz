import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { EffectSpec } from "../effects.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

// Mystery Booster Commander Edition's conjure cards, on MTG Arena's conjure
// (a new card, not a token, owned by its conjurer) and "perpetually".

const apply = (game: Game, player: PlayerId, effect: EffectSpec): void => {
  game.debugApplyEffect(player, effect, []);
  settle(game);
};
const named = (game: Game, ids: readonly ObjectId[], name: string): ObjectId[] =>
  ids.filter((id) => game.state.objects[id].cardName === name);
const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const onBattlefield = (game: Game, name: string): ObjectId[] =>
  named(game, game.state.zones.shared.battlefield, name);

describe("conjure", () => {
  it("makes a card you own, not a token, that stays a card as it moves", () => {
    const { game } = table();
    apply(game, A, { kind: "conjure", name: "Grizzly Bears", to: "hand" });
    const [bears] = named(game, hand(game), "Grizzly Bears");
    expect(bears).toBeDefined();
    const o = game.state.objects[bears];
    expect(o.isToken).toBe(false);
    expect(o.owner).toBe(A);
    lands(game, "Forest", 2);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    // A card goes to its owner's graveyard; a token would cease to exist.
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("onto the battlefield it enters as any card put there does", () => {
    const { game } = table();
    apply(game, A, { kind: "conjure", name: "Llanowar Elves", to: "battlefield" });
    const [elves] = onBattlefield(game, "Llanowar Elves");
    expect(game.state.objects[elves].controller).toBe(A);
    expect(game.state.objects[elves].isToken).toBe(false);
  });
});

describe("Oracle of the Alpha", () => {
  it("conjures the Power Nine into your library", () => {
    const { game } = table();
    const before = library(game).length;
    enter(game, "Oracle of the Alpha");
    expect(library(game)).toHaveLength(before + 9);
    for (const name of ["Black Lotus", "Mox Pearl", "Ancestral Recall", "Time Walk", "Timetwister"]) {
      expect(named(game, library(game), name)).toHaveLength(1);
    }
  });
});

describe("the Collectors: each conjures its Mox once", () => {
  it("Ruby Collector: attacking with three, a Mox Ruby — only the first time", () => {
    const { game, a } = table();
    spawn(game, "Ruby Collector");
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, attackers);
    expect(named(game, hand(game), "Mox Ruby")).toHaveLength(1);
    toStep(game, "precombat-main", A);
    attack(game, a, attackers);
    expect(named(game, hand(game), "Mox Ruby")).toHaveLength(1);
  });

  it("Sapphire Collector: the second noncreature spell in a turn", () => {
    const { game } = table();
    spawn(game, "Sapphire Collector");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(named(game, hand(game), "Mox Sapphire")).toHaveLength(0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(named(game, hand(game), "Mox Sapphire")).toHaveLength(1);
  });

  it("Emerald Collector: the third card drawn in a turn", () => {
    const { game } = table();
    spawn(game, "Emerald Collector");
    // Turn 1's draw step drew the first.
    apply(game, A, { kind: "draw", amount: 1 });
    expect(named(game, hand(game), "Mox Emerald")).toHaveLength(0);
    apply(game, A, { kind: "draw", amount: 1 });
    expect(named(game, hand(game), "Mox Emerald")).toHaveLength(1);
  });

  it("Jet Collector: four cards in your graveyard at your second main phase; and its finality reanimation", () => {
    const { game } = table();
    const jet = spawn(game, "Jet Collector");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Wastes");
    const bears = toGraveyard(game, "Grizzly Bears");
    toStep(game, "postcombat-main", A);
    settle(game);
    expect(named(game, hand(game), "Mox Jet")).toHaveLength(1);
    lands(game, "Swamp", 3);
    activate(game, jet, 0, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "finality")).toBe(1);
  });

  it("Jet Collector: too few cards, no Mox — and the chance isn't used up", () => {
    const { game } = table();
    spawn(game, "Jet Collector");
    toStep(game, "postcombat-main", A);
    settle(game);
    expect(named(game, hand(game), "Mox Jet")).toHaveLength(0);
    for (let i = 0; i < 4; i += 1) toGraveyard(game, "Wastes");
    toStep(game, "postcombat-main", A);
    settle(game);
    expect(named(game, hand(game), "Mox Jet")).toHaveLength(1);
  });

  it("Pearl Collector: 4 life gained, a Mox Pearl; perpetual lifelink goes with the card", () => {
    const { game } = table();
    const pearl = spawn(game, "Pearl Collector");
    apply(game, A, { kind: "gain-life", amount: 4 });
    toStep(game, "postcombat-main", A);
    settle(game);
    expect(named(game, hand(game), "Mox Pearl")).toHaveLength(1);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    activate(game, pearl, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    lands(game, "Forest", 2);
    cast(game, bears);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
});

describe("Perforator Crocodile", () => {
  it("a Stab Wound you own, attached to each creature your opponents control", () => {
    const { game } = table();
    // Big enough to live through the Wounds' -2/-2.
    const theirs = [spawn(game, "Serra Angel", B), spawn(game, "Craw Wurm", B)];
    spawn(game, "Grizzly Bears");
    enter(game, "Perforator Crocodile");
    const wounds = onBattlefield(game, "Stab Wound");
    expect(wounds).toHaveLength(2);
    expect(wounds.map((w) => game.state.objects[w].attachedTo).sort()).toEqual([...theirs].sort());
    for (const w of wounds) {
      expect(game.state.objects[w].controller).toBe(A);
      expect(game.state.objects[w].isToken).toBe(false);
    }
  });
});

describe("Overcooked", () => {
  it("nobody gains life; a Food at your end step, or Food Fight after a celebration", () => {
    const { game } = table();
    spawn(game, "Overcooked");
    apply(game, A, { kind: "gain-life", amount: 3 });
    expect(game.state.players[A].life).toBe(20);
    toStep(game, "end", A);
    settle(game);
    expect(onBattlefield(game, "Food Token")).toHaveLength(1);
    toStep(game, "precombat-main", A);
    enter(game, "Grizzly Bears");
    enter(game, "Llanowar Elves");
    toStep(game, "end", A);
    settle(game);
    expect(onBattlefield(game, "Food Fight")).toHaveLength(1);
    expect(onBattlefield(game, "Food Token")).toHaveLength(1);
  });
});

describe("Case of the Lost Witness", () => {
  it("conjures four Fblthp into your library and draws", () => {
    const { game } = table();
    const before = library(game).length;
    const cards = hand(game).length;
    enter(game, "Case of the Lost Witness");
    expect(named(game, library(game), "Fblthp, the Lost").length + named(game, hand(game), "Fblthp, the Lost").length).toBe(4);
    expect(library(game).length + hand(game).length).toBe(before + cards + 4);
  });
});

describe("Euru, Acorn Scrounger", () => {
  it("foraging conjures Chitterspitter; Squirrels hitting a player, a token sacrificed, add acorns", () => {
    const { game, a } = table();
    spawn(game, "Food Token");
    // With an empty graveyard, sacrificing the Food is the one way offered.
    pickModes(a, 0);
    const euru = enter(game, "Euru, Acorn Scrounger");
    const [spitter] = onBattlefield(game, "Chitterspitter");
    expect(spitter).toBeDefined();
    expect(game.state.objects[spitter].isToken).toBe(false);
    // A real token (`spawn` makes a token's definition a card).
    apply(game, A, { kind: "create-token", token: "Treasure Token", count: 1 });
    pickModes(a, 0);
    attack(game, a, [euru]);
    expect(counters(game, spitter, "acorn")).toBe(1);
  });
});
