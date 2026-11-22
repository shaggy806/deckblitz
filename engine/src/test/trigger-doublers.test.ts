/**
 * "…that ability triggers an additional time": the causes `doubleTriggers`
 * gained — a spell cast or copied (Veyran, Voice of Duality), a permanent
 * being dealt damage, a creature dying (Teysa Karlov) — and the source-keyed
 * `doubleTriggersOf`: "if a triggered ability of an Ally you control
 * triggers" (Katara, the Fearless), "of Cloud or an Equipment attached to it"
 * while Cloud is equipped (Cloud, Midgar Mercenary).
 */

import { describe, expect, it } from "vitest";

import type { TriggerSpec } from "../abilities.js";
import type { StaticAbility } from "../cards/define.js";
import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const gainOne: EffectSpec = { kind: "gain-life", amount: 1 };

const doubler = (name: string, ability: Omit<StaticAbility, "affects" | "text">, extra = {}) =>
  defineCard({
    name,
    manaCost: "{0}",
    types: ["enchantment"],
    text: name,
    static: [{ affects: { scope: "self" }, text: name, ...ability }],
    ...extra,
  });
const creature = (
  name: string,
  subtypes: readonly string[],
  trigger?: TriggerSpec,
  effect: EffectSpec = gainOne,
  statics: readonly StaticAbility[] = [],
) =>
  defineCard({
    name,
    manaCost: "{0}",
    types: ["creature"],
    subtypes: [...subtypes],
    power: 2,
    toughness: 2,
    text: name,
    static: [...statics],
    triggered:
      trigger === undefined ? [] : [{ trigger, targets: [], effect, resolve: null, text: name }],
  });

const registry = createDefaultRegistry()
  // Katara's shape.
  .register(doubler("Test Ally Doubler", { doubleTriggersOf: { filter: { subtype: "Ally", controlledBy: "you" } } }))
  .register(creature("Test Ally", ["Human", "Ally"], { on: "enters-battlefield", who: "self" }))
  .register(creature("Test Loner", ["Human"], { on: "enters-battlefield", who: "self" }))
  // Cloud's shape: "As long as ~ is equipped, if an ability of ~ or an
  // Equipment attached to it triggers, …"
  .register(
    creature(
      "Test Mercenary",
      ["Human", "Soldier"],
      { on: "step-begins", step: "upkeep", who: "you" },
      gainOne,
      [
        {
          affects: { scope: "self" },
          condition: { kind: "source", filter: { equipped: true } },
          doubleTriggersOf: { selfAndEquipment: true },
          text: "As long as Test Mercenary is equipped, …",
        },
      ],
    ),
  )
  .register(
    defineCard({
      name: "Test Blade",
      manaCost: "{0}",
      types: ["artifact"],
      subtypes: ["Equipment"],
      text: "",
      triggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: gainOne,
          resolve: null,
          text: "At the beginning of your upkeep, you gain 1 life.",
        },
      ],
    }),
  )
  // The new causes.
  .register(doubler("Test Spell Doubler", { doubleTriggers: { cause: "cast-or-copy", filter: { typesAnyOf: ["instant", "sorcery"], controlledBy: "you" } } }))
  .register(
    doubler("Test Spell Watcher", {}, {
      triggered: [
        {
          trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
          targets: [],
          effect: gainOne,
          resolve: null,
          text: "Whenever you cast an instant or sorcery spell, you gain 1 life.",
        },
      ],
    }),
  )
  .register(doubler("Test Damage Doubler", { doubleTriggers: { cause: "dealt-damage", filter: { type: "creature", controlledBy: "you" } } }))
  .register(creature("Test Enraged", ["Dinosaur"], { on: "dealt-damage", who: "self" }))
  .register(doubler("Test Death Doubler", { doubleTriggers: { cause: "dies", filter: { type: "creature" } } }))
  .register(creature("Test Mourner", ["Human"], { on: "dies", who: "you-control", filter: { type: "creature" } }));

const setUp = () => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: Array<string>(40).fill("Mountain") },
      { player: B, cards: Array<string>(40).fill("Mountain") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
  return game;
};

const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;
const life = (game: Game, player: PlayerId = A): number => game.state.players[player].life;
const enter = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = game.debugSpawn(name, player, "battlefield", { announceEntry: true });
  game.advanceUntil(quiet);
  return id;
};

describe("doubleTriggersOf: keyed on whose ability it is", () => {
  it("an Ally you control's trigger fires twice; a non-Ally's once", () => {
    const game = setUp();
    game.debugSpawn("Test Ally Doubler", A, "battlefield");
    enter(game, "Test Ally");
    expect(life(game)).toBe(22);
    enter(game, "Test Loner");
    expect(life(game)).toBe(23);
  });

  it("an opponent's Ally isn't yours", () => {
    const game = setUp();
    game.debugSpawn("Test Ally Doubler", A, "battlefield");
    enter(game, "Test Ally", B);
    expect(life(game, B)).toBe(21);
  });

  it("Cloud's shape: its own and its Equipment's abilities, only while equipped", () => {
    const game = setUp();
    game.debugSpawn("Test Mercenary", A, "battlefield");
    const blade = game.debugSpawn("Test Blade", A, "battlefield");
    // Unequipped: one each at the next upkeep.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    expect(life(game)).toBe(22);

    const mercenary = game.battlefield.find((id) => game.state.objects[id].cardName === "Test Mercenary")!;
    game.debugApplyEffect(A, { kind: "attach", target: 0 }, [{ kind: "object", object: mercenary }], {
      source: blade,
    });
    expect(game.state.objects[blade].attachedTo).toBe(mercenary);
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "draw");
    // Equipped: two each.
    expect(life(game)).toBe(26);
  });

  // A bug report, 2026-11-21: Skullclamp on Cloud drew two. The dies trigger
  // looks back at Cloud, equipped, as it last existed (rule 603.10a).
  it("Cloud dying under Skullclamp draws four; another creature's Skullclamp draws two", () => {
    const hand = (game: Game) => game.state.zones.perPlayer[A].hand.length;
    const clampOnto = (game: Game, name: string) => {
      const host = game.debugSpawn(name, A, "battlefield");
      const clamp = game.debugSpawn("Skullclamp", A, "battlefield");
      const before = hand(game);
      // +1/-1 on a toughness-1 creature: it dies in the state-based check.
      game.debugApplyEffect(A, { kind: "attach", target: 0 }, [{ kind: "object", object: host }], { source: clamp });
      game.advanceUntil((s) => s.objects[host].zone === "graveyard" && quiet(s));
      return hand(game) - before;
    };
    expect(clampOnto(setUp(), "Cloud, Midgar Mercenary")).toBe(4);
    expect(clampOnto(setUp(), "Llanowar Elves")).toBe(2);
    // Cloud beside it, unequipped, doubles nothing.
    const game = setUp();
    game.debugSpawn("Cloud, Midgar Mercenary", A, "battlefield");
    expect(clampOnto(game, "Llanowar Elves")).toBe(2);
  });
});

// A doubler that leaves in the same event as the ability's permanent still
// doubles its leaves-the-battlefield ability (rule 603.10a; Teysa Karlov's
// and Drivnod's "including Teysa itself dying" rulings, for the source-keyed
// doublers). Doomed Traveler, a 1/1 Human Soldier, leaves a Spirit as it dies.
describe("doubleTriggersOf: a doubler leaving in the same event", () => {
  const spirits = (game: Game) =>
    game.battlefield
      .filter((id) => game.state.objects[id].cardName === "Spirit Token")
      .reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
  const wrath = (game: Game, filter: EffectSpec & { kind: "destroy-all" } = { kind: "destroy-all", filter: { type: "creature" } }) => {
    game.debugApplyEffect(A, filter, [], {});
    game.advanceUntil(quiet);
    return spirits(game);
  };

  it("Delney dying beside a small creature: its dies ability triggers twice", () => {
    const game = setUp();
    game.debugSpawn("Delney, Streetwise Lookout", A, "battlefield");
    game.debugSpawn("Doomed Traveler", A, "battlefield");
    expect(wrath(game)).toBe(2);
  });

  it("an opponent's Delney, or none, leaves it at once", () => {
    const game = setUp();
    game.debugSpawn("Delney, Streetwise Lookout", B, "battlefield");
    game.debugSpawn("Doomed Traveler", A, "battlefield");
    expect(wrath(game)).toBe(1);
    const alone = setUp();
    alone.debugSpawn("Doomed Traveler", A, "battlefield");
    expect(wrath(alone)).toBe(1);
  });

  it("a Delney that left earlier doubles nothing", () => {
    const game = setUp();
    game.debugSpawn("Delney, Streetwise Lookout", A, "battlefield");
    expect(wrath(game)).toBe(0);
    game.debugSpawn("Doomed Traveler", A, "battlefield");
    expect(wrath(game)).toBe(1);
  });

  it("Roaming Throne reads the type it had chosen", () => {
    for (const [type, expected] of [["Human", 2], ["Goblin", 1]] as const) {
      const game = setUp();
      const throne = game.debugSpawn("Roaming Throne", A, "battlefield");
      game.state.objects[throne].chosenCreatureType = type;
      game.debugSpawn("Doomed Traveler", A, "battlefield");
      expect(wrath(game)).toBe(expected);
    }
  });

  // "For as long as Lwaxana Troi remains tapped, if a triggered ability of
  // that creature triggers…": the creature has it as it dies, whether she
  // stays or dies with it; not once she has untapped.
  it("Lwaxana Troi's chosen creature dying, alone or with her", () => {
    const chosen = (game: Game) => {
      const troi = game.debugSpawn("Lwaxana Troi, Charming Guest", A, "battlefield");
      const traveler = game.debugSpawn("Doomed Traveler", A, "battlefield");
      game.state.objects[troi].tapped = true;
      const grant = registry.get("Lwaxana Troi, Charming Guest").activated[0].effect!;
      game.debugApplyEffect(A, grant, [{ kind: "object", object: traveler }], { source: troi });
      return { troi, traveler };
    };
    const together = setUp();
    chosen(together);
    expect(wrath(together)).toBe(2);

    const alone = setUp();
    chosen(alone);
    expect(wrath(alone, { kind: "destroy-all", filter: { name: "Doomed Traveler" } })).toBe(2);

    const untapped = setUp();
    const { troi } = chosen(untapped);
    untapped.debugApplyEffect(A, { kind: "untap-all", filter: { name: "Lwaxana Troi, Charming Guest" } }, [], {});
    expect(untapped.state.objects[troi].tapped).toBe(false);
    expect(wrath(untapped)).toBe(1);
  });

  it("Wizard's Staff, destroyed with its host or left behind", () => {
    for (const filter of [{ typesAnyOf: ["creature", "artifact"] }, { type: "creature" }] as const) {
      const game = setUp();
      const host = game.debugSpawn("Doomed Traveler", A, "battlefield");
      const staff = game.debugSpawn("Wizard's Staff", A, "battlefield");
      game.debugApplyEffect(A, { kind: "attach", target: 0 }, [{ kind: "object", object: host }], { source: staff });
      expect(game.state.objects[staff].attachedTo).toBe(host);
      expect(wrath(game, { kind: "destroy-all", filter })).toBe(2);
    }
    // A Staff destroyed beside a creature it wasn't on.
    const game = setUp();
    game.debugSpawn("Doomed Traveler", A, "battlefield");
    game.debugSpawn("Wizard's Staff", A, "battlefield");
    expect(wrath(game, { kind: "destroy-all", filter: { typesAnyOf: ["creature", "artifact"] } })).toBe(1);
  });
});

describe("doubleTriggers' new causes", () => {
  it("cast-or-copy: casting an instant fires the cast trigger twice", () => {
    const game = setUp();
    game.debugSpawn("Test Spell Doubler", A, "battlefield");
    game.debugSpawn("Test Spell Watcher", A, "battlefield");
    game.debugSpawn("Mountain", A, "battlefield");
    const bolt = game.debugSpawn("Lightning Bolt", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [{ kind: "player", player: B }] });
    game.advanceUntil(quiet);
    expect(life(game)).toBe(22);
    expect(life(game, B)).toBe(17);
  });

  it("dealt-damage: a creature you control being dealt damage", () => {
    const game = setUp();
    game.debugSpawn("Test Damage Doubler", A, "battlefield");
    const dino = game.debugSpawn("Test Enraged", A, "battlefield");
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [{ kind: "object", object: dino }]);
    game.advanceUntil(quiet);
    expect(life(game)).toBe(22);
  });

  it("dies: a creature dying fires its watchers twice", () => {
    const game = setUp();
    game.debugSpawn("Test Death Doubler", A, "battlefield");
    game.debugSpawn("Test Mourner", A, "battlefield");
    const bears = game.debugSpawn("Grizzly Bears", A, "battlefield");
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: bears }]);
    game.advanceUntil(quiet);
    expect(life(game)).toBe(22);
  });
});
