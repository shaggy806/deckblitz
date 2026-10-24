/**
 * Blight (rule 701.68): "blight N" is putting N -1/-1 counters on a creature
 * you control (701.68a), chosen by the player who blights — with the ordinary
 * `choose-permanents` decision, asked only when there's more than one to
 * choose from. A player who controls no creature can't choose to blight
 * (701.68b), and "the blighted creature" is the one chosen (701.68c).
 *
 * Each shape the engine has: an activated ability's cost (`AbilityCost.blight`),
 * a branch of a spell's choice of additional costs (`additionalCost.options`),
 * an optional additional cost (`kicker` with `keyword: "blight"`), the
 * `blight` effect (a "you may", "each opponent", and a `then` reading the
 * blighted creature), and ward's cost.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { defineCard } from "../cards/define.js";
import { ward } from "../cards/helpers.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  named,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const casts = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game
    .legalActions(player)
    .filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

/** Whether `player` is being asked which creature blights. */
const askedToBlight = (game: Game, player: PlayerId = A): boolean => {
  const awaiting = game.state.awaiting;
  return awaiting?.kind === "choose-permanents" && awaiting.player === player && awaiting.blight !== undefined;
};

describe("blight as an activated ability's cost (Gristle Glutton)", () => {
  it("the activating player chooses the creature as the cost is paid, and the counter goes on it", () => {
    const { game, a } = table();
    const glutton = spawn(game, "Gristle Glutton");
    const bears = spawn(game, "Grizzly Bears");
    const shock = toHand(game, "Shock");
    const handSize = hand(game).length;
    a.chooseDiscardsFn = () => [shock];
    const seen = pickPermanents(a, bears);
    activate(game, glutton, 0, { settle: false });
    // Asked before anyone gets priority, the ability already on the stack.
    expect(askedToBlight(game)).toBe(true);
    expect(game.state.zones.shared.stack).toHaveLength(1);
    settle(game);
    expect(new Set(seen.offered)).toEqual(new Set([glutton, bears]));
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(counters(game, glutton, "-1/-1")).toBe(0);
    expect(game.state.objects[glutton].tapped).toBe(true);
    // Discarded the Shock, drew a card.
    expect(graveyard(game)).toEqual([shock]);
    expect(hand(game)).toHaveLength(handSize);
  });

  it("with an empty hand, nothing is discarded and nothing drawn ('if you do')", () => {
    const { game } = table();
    const glutton = spawn(game, "Gristle Glutton");
    for (const id of [...hand(game)]) game.state.objects[id].zone = "library";
    game.state.zones.perPlayer[A].library.push(...game.state.zones.perPlayer[A].hand);
    game.state.zones.perPlayer[A].hand = [];
    activate(game, glutton);
    expect(hand(game)).toHaveLength(0);
    expect(counters(game, glutton, "-1/-1")).toBe(1);
  });

  it("with only the source to blight, it blights itself unasked", () => {
    const { game } = table();
    const glutton = spawn(game, "Gristle Glutton");
    activate(game, glutton);
    expect(counters(game, glutton, "-1/-1")).toBe(1);
    expect(pt(game, glutton)).toEqual({ power: 0, toughness: 2 });
  });

  it("a 1-toughness creature may be the one (the ruling): it dies once the cost is paid", () => {
    const { game, a } = table();
    const glutton = spawn(game, "Gristle Glutton");
    const elves = spawn(game, "Llanowar Elves");
    pickPermanents(a, elves);
    activate(game, glutton);
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("blight as a branch of a choice of additional costs (Bogslither's Embrace, Wild Unraveling)", () => {
  it("is offered only with a creature to blight (rule 701.68b)", () => {
    const { game } = table();
    spawn(game, "Swamp");
    lands(game, "Wastes", 4);
    const embrace = toHand(game, "Bogslither's Embrace");
    spawn(game, "Grizzly Bears", B);
    expect(casts(game, embrace).map((c) => c.costOptionText)).toEqual(["Pay {3}"]);
    spawn(game, "Grizzly Bears");
    expect(casts(game, embrace).map((c) => c.costOptionText)).toEqual(["Blight 1", "Pay {3}"]);
  });

  it("blighting pays it: the caster picks the creature once the spell is on the stack", () => {
    const { game, a } = table();
    spawn(game, "Swamp");
    lands(game, "Wastes", 1);
    const mine = spawn(game, "Grizzly Bears");
    const glutton = spawn(game, "Gristle Glutton");
    const theirs = spawn(game, "Grizzly Bears", B);
    const embrace = toHand(game, "Bogslither's Embrace");
    pickPermanents(a, glutton);
    cast(game, embrace, { targets: [ref(theirs)], costOption: 0, settle: false });
    expect(askedToBlight(game)).toBe(true);
    expect(zone(game, embrace)).toBe("stack");
    settle(game);
    expect(counters(game, glutton, "-1/-1")).toBe(1);
    expect(counters(game, mine, "-1/-1")).toBe(0);
    expect(zone(game, theirs)).toBe("exile");
  });

  it("paying {3} instead blights nothing", () => {
    const { game } = table();
    spawn(game, "Swamp");
    lands(game, "Wastes", 4);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Bogslither's Embrace"), { targets: [ref(theirs)], costOption: 1 });
    expect(counters(game, mine, "-1/-1")).toBe(0);
    expect(zone(game, theirs)).toBe("exile");
  });

  it("blight 2 may kill the creature that pays it, and the spell still resolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    const unraveling = toHand(game, "Wild Unraveling");
    // Alice shocks bob, holds priority, and counters her own Shock,
    // blighting her only creature: it dies, and the counter still resolves.
    cast(game, shock, { targets: [ref(B)], settle: false });
    expect(casts(game, unraveling).map((c) => c.costOptionText)).toEqual(["Blight 2"]);
    cast(game, unraveling, { targets: [ref(shock)], costOption: 0 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, unraveling)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(20);
  });
});

describe("blight as an optional additional cost (Burning Curiosity)", () => {
  const stockLibrary = (game: Game): void => {
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Grizzly Bears");
  };

  it("the blighting cast is offered only with a creature to blight (rule 701.68b)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const curiosity = toHand(game, "Burning Curiosity");
    expect(casts(game, curiosity).map((c) => c.kicked === true)).toEqual([false]);
    spawn(game, "Grizzly Bears");
    const offers = casts(game, curiosity);
    expect(offers.map((c) => c.kicked === true)).toEqual([false, true]);
    expect(offers[1]).toMatchObject({ kickerKeyword: "blight", kickerCost: "1" });
  });

  it("paid, it blights the chosen creature and exiles three; not paid, two", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    stockLibrary(game);
    const before = game.state.zones.shared.exile.length;
    pickPermanents(a, bears);
    cast(game, toHand(game, "Burning Curiosity"), { kicked: true });
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(counters(game, elves, "-1/-1")).toBe(0);
    expect(game.state.zones.shared.exile.length - before).toBe(3);

    const mid = game.state.zones.shared.exile.length;
    cast(game, toHand(game, "Burning Curiosity"));
    expect(game.state.zones.shared.exile.length - mid).toBe(2);
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });
});

describe("the blight effect", () => {
  it("'you may blight 1. If you do, …': not offered with no creature (rule 701.68b), so nothing happens", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Swamp");
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Boggart Mischief"));
    expect(asked).toBe(0);
    expect(tokensNamed(game, "Goblin Token (Boggart Mischief)")).toBe(0);
  });

  it("taken, the chosen creature gets the counter, then the tokens are made", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    spawn(game, "Swamp");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    pickPermanents(a, bears);
    cast(game, toHand(game, "Boggart Mischief"));
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(counters(game, elves, "-1/-1")).toBe(0);
    expect(tokensNamed(game, "Goblin Token (Boggart Mischief)", A)).toBe(2);
  });

  it("declined, nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Swamp");
    lands(game, "Wastes", 2);
    pickModes(a);
    cast(game, toHand(game, "Boggart Mischief"));
    expect(counters(game, bears, "-1/-1")).toBe(0);
    expect(tokensNamed(game, "Goblin Token (Boggart Mischief)")).toBe(0);
  });

  it("'each opponent blights 1': each chooses a creature of their own; one with none does nothing", () => {
    const { game, b, c } = table({ players: 3 });
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobElves = spawn(game, "Llanowar Elves", B);
    const carolBears = spawn(game, "Grizzly Bears", C);
    const carolGlutton = spawn(game, "Gristle Glutton", C);
    const seenB = pickPermanents(b, bobBears);
    const seenC = pickPermanents(c, carolGlutton);
    // Morcant enters: its own trigger.
    game.debugSpawn("High Perfect Morcant", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(new Set(seenB.offered)).toEqual(new Set([bobBears, bobElves]));
    expect(new Set(seenC.offered)).toEqual(new Set([carolBears, carolGlutton]));
    expect(counters(game, bobBears, "-1/-1")).toBe(1);
    expect(counters(game, bobElves, "-1/-1")).toBe(0);
    expect(counters(game, carolGlutton, "-1/-1")).toBe(1);
    expect(counters(game, carolBears, "-1/-1")).toBe(0);
    // Alice's own creatures are never asked about.
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === A && counters(game, id, "-1/-1") > 0)).toEqual([]);
  });

  it("an opponent with no creature can't blight, and the others still do", () => {
    const { game, c } = table({ players: 3 });
    const carolBears = spawn(game, "Grizzly Bears", C);
    pickPermanents(c, carolBears);
    game.debugSpawn("High Perfect Morcant", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(counters(game, carolBears, "-1/-1")).toBe(1);
  });

  it("'the blighted creature' (rule 701.68c) is the one chosen: Grub copies it, tapped and attacking", () => {
    const { game, a } = table();
    const grub = spawn(game, "Grub, Storied Matriarch");
    // Turned to Grub, Notorious Auntie.
    game.state.objects[grub].face = 1;
    const memnite = spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickPermanents(a, bears);
    attack(game, a, [grub]);
    expect(new Set(seen.offered)).toEqual(new Set([grub, memnite, bears]));
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(counters(game, memnite, "-1/-1")).toBe(0);
    const copies = game.battlefield.filter((id) => game.state.objects[id].isToken);
    expect(copies).toHaveLength(1);
    const copy = game.state.objects[copies[0]];
    expect(copy.copyOf).toBe("Grizzly Bears");
    expect(copy.controller).toBe(A);
    expect(copy.tapped).toBe(true);
    // A copy has none of the original's counters (rule 707.2).
    expect(pt(game, copies[0])).toEqual({ power: 2, toughness: 2 });
    // It was attacking: Bob took Grub's 2 and the copy's 2.
    expect(game.state.players[B].life).toBe(16);
    // "At the beginning of the end step, sacrifice this token."
    toStep(game, "end");
    settle(game);
    expect(game.battlefield.filter((id) => game.state.objects[id].isToken)).toEqual([]);
  });
});

describe("Ward—Blight N", () => {
  const WARDED = defineCard({
    name: "Blight-Warded Bear",
    manaCost: "{1}{G}",
    colors: ["G"],
    types: ["creature"],
    subtypes: ["Bear"],
    power: 2,
    toughness: 2,
    text: "Ward—Blight 1.",
    triggered: [ward({ blight: 1 })],
  });

  const mk = () => {
    const registry = createDefaultRegistry();
    registry.register(WARDED);
    const a = new ScriptedController(A);
    const b = new ScriptedController(B);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: a, [B]: b },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    return { game, a };
  };

  it("the targeting player may blight one of their creatures to pay it", () => {
    const { game, a } = mk();
    const warded = spawn(game, "Blight-Warded Bear", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(warded)] });
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(zone(game, warded)).toBe("graveyard");
  });

  it("with no creature to blight, it can't be paid: the spell is countered", () => {
    const { game } = mk();
    const warded = spawn(game, "Blight-Warded Bear", B);
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(warded)] });
    expect(zone(game, warded)).toBe("battlefield");
    expect(zone(game, shock)).toBe("graveyard");
  });
});

describe("blight as a cost with no creature to blight (rule 701.68b)", () => {
  it("an ability whose cost blights can't be activated", () => {
    const BLIGHTING_ROCK = defineCard({
      name: "Blighting Rock",
      manaCost: "{1}",
      colors: [],
      types: ["artifact"],
      text: "{T}, Blight 1: Draw a card.",
      activated: [
        { cost: { mana: null, tap: true, blight: 1 }, targets: [], effect: { kind: "draw", amount: 1 }, resolve: null, text: "{T}, Blight 1: Draw a card." },
      ],
    });
    const registry = createDefaultRegistry();
    registry.register(BLIGHTING_ROCK);
    const a = new ScriptedController(A);
    const b = new ScriptedController(B);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: a, [B]: b },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const rock = spawn(game, "Blighting Rock");
    spawn(game, "Grizzly Bears", B);
    const action = { type: "activate-ability", player: A, source: rock, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch(action)).toMatch(/no creature to blight/);
    const bears = spawn(game, "Grizzly Bears");
    expect(game.canDispatch(action)).toBeNull();
    game.dispatch(action);
    settle(game);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(named(game, "Grizzly Bears", A)).toEqual([bears]);
  });
});

describe("blight with counter prevention (rule 701.68b: unable to put the counters on, no blighting)", () => {
  it("under Melira, a choice of additional costs offers only the other branch, and Lethal Sting can't be cast", () => {
    const { game } = table();
    spawn(game, "Swamp");
    lands(game, "Wastes", 4);
    spawn(game, "Grizzly Bears");
    const embrace = toHand(game, "Bogslither's Embrace");
    const sting = toHand(game, "Lethal Sting");
    spawn(game, "Grizzly Bears", B);
    expect(casts(game, embrace).map((c) => c.costOptionText)).toEqual(["Blight 1", "Pay {3}"]);
    expect(casts(game, sting)).not.toHaveLength(0);
    spawn(game, "Melira, Sylvok Outcast");
    expect(casts(game, embrace).map((c) => c.costOptionText)).toEqual(["Pay {3}"]);
    expect(casts(game, sting)).toHaveLength(0);
  });

  it("an opponent's Melira protects only their creatures: Lethal Sting is cast, and destroys", () => {
    const { game } = table();
    spawn(game, "Swamp");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const melira = spawn(game, "Melira, Sylvok Outcast", B);
    cast(game, toHand(game, "Lethal Sting"), { targets: [ref(melira)], costOption: 0 });
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(zone(game, melira)).toBe("graveyard");
  });

  it("under Melira, the blighting kicker and an ability's blight cost aren't offered", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const glutton = spawn(game, "Gristle Glutton");
    const curiosity = toHand(game, "Burning Curiosity");
    spawn(game, "Melira, Sylvok Outcast");
    expect(casts(game, curiosity).map((c) => c.kicked === true)).toEqual([false]);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: glutton, abilityIndex: 0, targets: [] })).toMatch(
      /no creature to blight/,
    );
  });

  it("under Melira, 'you may blight 1' isn't offered", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    spawn(game, "Melira, Sylvok Outcast");
    spawn(game, "Swamp");
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Boggart Mischief"));
    expect(asked).toBe(0);
    expect(tokensNamed(game, "Goblin Token (Boggart Mischief)")).toBe(0);
  });

  it("paid as a cost, only a creature the counter can go on is chosen: the protected one isn't offered", () => {
    const WARDEN = defineCard({
      name: "Bear Warden",
      manaCost: "{1}{G}",
      colors: ["G"],
      types: ["enchantment"],
      text: "Bears you control can't have -1/-1 counters put on them.",
      static: [
        {
          affects: { scope: "self" },
          preventsCounters: { permanents: { subtype: "Bear", controlledBy: "you" }, kind: "-1/-1" },
          text: "Bears you control can't have -1/-1 counters put on them.",
        },
      ],
    });
    const registry = createDefaultRegistry();
    registry.register(WARDEN);
    const a = new ScriptedController(A);
    const b = new ScriptedController(B);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: a, [B]: b },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    spawn(game, "Bear Warden");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Swamp");
    lands(game, "Wastes", 2);
    let asked = false;
    a.choosePermanentsFn = () => {
      asked = true;
      return [bears];
    };
    cast(game, toHand(game, "Lethal Sting"), { targets: [ref(theirs)], costOption: 0 });
    // The Elves were the one creature that could pay: chosen unasked.
    expect(asked).toBe(false);
    expect(zone(game, elves)).toBe("graveyard");
    expect(counters(game, bears, "-1/-1")).toBe(0);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
