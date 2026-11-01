/**
 * An `unless`'s ways out (rule 118.12a: "[do something] unless [a player does
 * something else]" is "[a player may do something else]; if they don't, [do
 * something]"), one `UnlessOption` kind per payment, each offered only to a
 * player who can do all of it (rule 118.3): mana and life together (Mundungu),
 * life by an amount (Essence Vortex), energy (Rush of Inspiration), {G} for
 * each counter with an "if you pay" (Cyclone), a -1/-1 counter (a test card:
 * the Chants wait on their trigger), returning and tapping a permanent (Karoo,
 * Command Bridge), and sacrificing a given permanent (Enchanter's Bane, Curse
 * Artifact).
 */

import { describe, expect, it } from "vitest";

import { createDefaultRegistry, defineCard } from "../cards.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickPermanents,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** The seat answers its `unless` by taking the option (`true`) or not, and
 * records what it was offered. */
const answer = (seat: ScriptedController, take: boolean) => {
  const offered: string[][] = [];
  seat.chooseModesFn = (_view, _min, _max, modes) => {
    offered.push([...modes]);
    return take ? [0] : [];
  };
  return offered;
};

describe("mana and life together (Mundungu)", () => {
  /** Alice casts Shock with `spare` lands over, and Bob's Mundungu aims at it;
   * she's asked with `aliceLife` life. */
  const shocked = (spare: number, take: boolean, aliceLife = 20) => {
    const { game, a, b } = table();
    game.state.players[A].life = aliceLife;
    const mundungu = spawn(game, "Mundungu", B);
    lands(game, "Mountain", 1 + spare);
    const shock = toHand(game, "Shock");
    const offered = answer(a, take);
    cast(game, shock, { targets: [ref(B)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    b.chooseModesFn = () => [];
    game.dispatch({ type: "activate-ability", player: B, source: mundungu, abilityIndex: 0, targets: [ref(shock)] });
    settle(game);
    return { game, shock, offered };
  };

  it("pays {1} and 1 life together, and the spell resolves", () => {
    const { game, offered } = shocked(1, true);
    expect(offered[0]).toEqual(["Pay {1} and 1 life"]);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });

  it("counters the spell when they decline, and takes neither", () => {
    const { game, shock } = shocked(1, false);
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("isn't offered without the mana, or without the life", () => {
    const noMana = shocked(0, true);
    expect(noMana.offered).toEqual([]);
    expect(life(noMana.game, B)).toBe(20);
    expect(life(noMana.game, A)).toBe(20);
    // 1 life pays 1 life (rule 119.4), which leaves 0.
    const lastLife = shocked(1, true, 1);
    expect(lastLife.offered[0]).toEqual(["Pay {1} and 1 life"]);
    expect(life(lastLife.game, A)).toBe(0);
  });
});

describe("life by an amount (Essence Vortex)", () => {
  it("is read off the target, and paying it saves the creature", () => {
    const { game, b } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    const offered = answer(b, true);
    cast(game, toHand(game, "Essence Vortex"), { targets: [ref(wurm)] });
    expect(offered[0]).toEqual(["Pay 4 life"]);
    expect(life(game, B)).toBe(16);
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("destroys it when they don't, or can't", () => {
    const declined = table();
    lands(declined.game, "Island", 2);
    lands(declined.game, "Swamp", 1);
    const wurm = spawn(declined.game, "Craw Wurm", B);
    answer(declined.b, false);
    cast(declined.game, toHand(declined.game, "Essence Vortex"), { targets: [ref(wurm)] });
    expect(zone(declined.game, wurm)).toBe("graveyard");
    expect(life(declined.game, B)).toBe(20);

    const broke = table();
    broke.game.state.players[B].life = 3;
    lands(broke.game, "Island", 2);
    lands(broke.game, "Swamp", 1);
    const other = spawn(broke.game, "Craw Wurm", B);
    const offered = answer(broke.b, true);
    cast(broke.game, toHand(broke.game, "Essence Vortex"), { targets: [ref(other)] });
    expect(offered).toEqual([]);
    expect(zone(broke.game, other)).toBe("graveyard");
  });
});

describe("energy (Rush of Inspiration)", () => {
  const rush = (energy: number) => {
    const { game, a } = table();
    lands(game, "Island", 3);
    game.state.players[A].energy = energy;
    const cards = [toHand(game, "Wastes"), toHand(game, "Wastes"), toHand(game, "Wastes")];
    return { game, a, cards };
  };

  it("spends the energy and keeps the cards", () => {
    const { game, a, cards } = rush(3);
    const offered = answer(a, true);
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Rush of Inspiration"));
    expect(cards).toHaveLength(3);
    expect(offered[0]).toEqual(["Pay {E}{E}"]);
    expect(game.state.players[A].energy).toBe(1);
    expect(hand(game).length).toBe(handBefore + 2);
  });

  it("isn't offered short of it, and a card goes at random", () => {
    const { game, a } = rush(1);
    const offered = answer(a, true);
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Rush of Inspiration"));
    expect(offered).toEqual([]);
    expect(game.state.players[A].energy).toBe(1);
    expect(hand(game).length).toBe(handBefore + 1);
  });
});

describe("{G} for each counter, and if you pay (Cyclone)", () => {
  const upkeep = (forests: number, windCounters = 0) => {
    const { game, a } = table();
    const cyclone = spawn(game, "Cyclone");
    game.state.objects[cyclone].counters.wind = windCounters;
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", forests);
    return { game, a, cyclone, bears };
  };

  it("costs more each upkeep, and deals that much to each creature and player", () => {
    const { game, a, cyclone, bears } = upkeep(2, 1);
    const offered = answer(a, true);
    toStep(game, "upkeep");
    settle(game);
    expect(offered[0]).toEqual(["Pay {G}{G}"]);
    expect(counters(game, cyclone, "wind")).toBe(2);
    expect(zone(game, cyclone)).toBe("battlefield");
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("is sacrificed without the damage when not paid", () => {
    const { game, a, cyclone, bears } = upkeep(1, 1);
    const offered = answer(a, true);
    toStep(game, "upkeep");
    settle(game);
    expect(offered).toEqual([]);
    expect(zone(game, cyclone)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("a counter on a permanent of theirs", () => {
  const CHANT = defineCard({
    name: "Test Chant",
    manaCost: "{1}",
    colors: [],
    types: ["sorcery"],
    text: "This spell deals 3 damage to target player unless they put a -1/-1 counter on a creature they control.",
    targets: ["player"],
    effect: {
      kind: "unless",
      chooser: 0,
      options: [
        {
          putCounter: "-1/-1",
          on: { type: "creature", controlledBy: "you" },
          text: "Put a -1/-1 counter on a creature you control",
        },
      ],
      otherwise: { kind: "damage", target: 0, amount: 3 },
    },
  });
  const chantAt = (take: boolean, creatures: readonly string[]) => {
    const seats = { [A]: new ScriptedController(A), [B]: new ScriptedController(B) };
    const game = Game.create({
      seed: 1,
      shuffle: false,
      startingPlayer: A,
      registry: createDefaultRegistry().register(CHANT),
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: seats,
      decks: [A, B].map((player: PlayerId) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const ids = creatures.map((name) => game.debugSpawn(name, B, "battlefield"));
    game.debugSpawn("Wastes", A, "battlefield");
    const offered = answer(seats[B], take);
    const picked = pickPermanents(seats[B], ...ids.slice(0, 1));
    cast(game, game.debugSpawn("Test Chant", A, "hand"), { targets: [ref(B)] });
    return { game, ids, offered, picked };
  };

  it("takes one of theirs, their choice, in place of the damage", () => {
    const { game, ids, offered, picked } = chantAt(true, ["Grizzly Bears", "Craw Wurm"]);
    expect(offered[0]).toEqual(["Put a -1/-1 counter on a creature you control"]);
    expect(picked.offered).toEqual(ids);
    expect(counters(game, ids[0], "-1/-1")).toBe(1);
    expect(life(game, B)).toBe(20);
  });

  it("isn't offered without a creature", () => {
    const { game, offered } = chantAt(true, []);
    expect(offered).toEqual([]);
    expect(life(game, B)).toBe(17);
  });
});

describe("returning a permanent (Karoo)", () => {
  it("returns an untapped Plains and stays", () => {
    const { game, a } = table();
    const plains = spawn(game, "Plains");
    const tapped = spawn(game, "Plains", A, { tapped: true });
    spawn(game, "Forest");
    answer(a, true);
    const picked = pickPermanents(a, plains);
    const karoo = enter(game, "Karoo");
    expect(picked.offered).toEqual([plains]);
    expect(zone(game, plains)).toBe("hand");
    expect(zone(game, tapped)).toBe("battlefield");
    expect(zone(game, karoo)).toBe("battlefield");
  });

  it("is sacrificed with no untapped Plains, or by choice", () => {
    const none = table();
    spawn(none.game, "Plains", A, { tapped: true });
    const offered = answer(none.a, true);
    const karoo = enter(none.game, "Karoo");
    expect(offered).toEqual([]);
    expect(zone(none.game, karoo)).toBe("graveyard");

    const declined = table();
    const plains = spawn(declined.game, "Plains");
    answer(declined.a, false);
    const other = enter(declined.game, "Karoo");
    expect(zone(declined.game, other)).toBe("graveyard");
    expect(zone(declined.game, plains)).toBe("battlefield");
  });
});

describe("tapping a permanent (Command Bridge)", () => {
  it("taps an untapped permanent, not necessarily a land, and stays", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const already = spawn(game, "Forest", A, { tapped: true });
    answer(a, true);
    const picked = pickPermanents(a, bears);
    const bridge = enter(game, "Command Bridge");
    expect(picked.offered).toEqual([bears]);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[already].tapped).toBe(true);
    expect(zone(game, bridge)).toBe("battlefield");
  });

  it("is sacrificed with nothing untapped to tap (it entered tapped)", () => {
    const { game, a } = table();
    const offered = answer(a, true);
    const bridge = enter(game, "Command Bridge");
    expect(offered).toEqual([]);
    expect(zone(game, bridge)).toBe("graveyard");
  });
});

describe("sacrificing a given permanent", () => {
  const endStepAt = (take: boolean) => {
    const { game, a, b } = table();
    spawn(game, "Enchanter's Bane");
    const prison = spawn(game, "Ghostly Prison", B); // mana value 3
    pickTargets(a, prison);
    const offered = answer(b, take);
    toStep(game, "end");
    settle(game);
    return { game, prison, offered };
  };

  it("Enchanter's Bane: its controller may sacrifice it", () => {
    const { game, prison, offered } = endStepAt(true);
    expect(offered[0]).toEqual(["Sacrifice it"]);
    expect(zone(game, prison)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("Enchanter's Bane: or it deals its mana value to them", () => {
    const { game, prison } = endStepAt(false);
    expect(zone(game, prison)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });

  /** Curse Artifact on Bob's Sol Ring, at Bob's upkeep. */
  const cursed = (take: boolean) => {
    const { game, b } = table();
    const ring = spawn(game, "Sol Ring", B);
    const curse = spawn(game, "Curse Artifact");
    game.state.objects[curse].attachedTo = ring;
    return { game, ring, curse, offeredB: answer(b, take) };
  };
  const toBobsUpkeep = (game: Game): void => {
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    settle(game);
  };

  it("Curse Artifact: that artifact, or 2 damage", () => {
    const { game, ring, offeredB } = cursed(true);
    toBobsUpkeep(game);
    expect(offeredB[0]).toEqual(["Sacrifice that artifact"]);
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, B)).toBe(20);

    const declined = cursed(false);
    toBobsUpkeep(declined.game);
    expect(zone(declined.game, declined.ring)).toBe("battlefield");
    expect(life(declined.game, B)).toBe(18);
  });

  it("Curse Artifact: an artifact they no longer control can't be sacrificed", () => {
    const { game, ring, offeredB } = cursed(true);
    // Alice takes it in response to the trigger: "that player" is still Bob,
    // and only its controller could sacrifice it.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.zones.shared.stack.length > 0);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: true }, [ref(ring)]);
    expect(game.state.objects[ring].controller).toBe(A);
    settle(game);
    expect(offeredB).toEqual([]);
    expect(zone(game, ring)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });

  it("Enchanter's Bane: an enchantment it controls itself is the same question", () => {
    const { game, a } = table();
    const bane = spawn(game, "Enchanter's Bane");
    pickTargets(a, bane);
    const offered = answer(a, true);
    toStep(game, "end");
    settle(game);
    expect(offered[0]).toEqual(["Sacrifice it"]);
    expect(zone(game, bane)).toBe("graveyard");
  });
});
