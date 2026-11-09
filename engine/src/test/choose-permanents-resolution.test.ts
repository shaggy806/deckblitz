/**
 * What an effect's later reads keep of the resolution around them: a
 * `choose-permanents`' `then` (its trigger object, a kept target's zone), an
 * `amounts` condition's target last-known (rule 608.2h), `isSource` in a mass
 * effect's filter, an impulse permission's `gate` ("you" is who holds it),
 * and "for as long as this remains tapped" over an untap and a retap
 * (rule 611.2b).
 */
import { describe, expect, it } from "vitest";

import { defineCard, type CardDefinition } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { EffectSpec } from "../effects.js";
import { A, B, activate, cast, enter, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const spell = (name: string, targets: CardDefinition["targets"], effect: EffectSpec): CardDefinition =>
  defineCard({ name, manaCost: "{0}", types: ["sorcery"], text: name, targets, effect });

const WATCHER = "Test Watcher";
const KEEPER = "Test Keeper";
const READER = "Test Amounts Reader";
const EXILER = "Test Self Exiler";
const IMPULSE = "Test Gated Impulse";
const TAPPER = "Test Tapper";

const registry = createDefaultRegistry()
  .register(
    defineCard({
      name: WATCHER,
      manaCost: "{0}",
      types: ["enchantment"],
      text: "Whenever a creature you control enters, choose a creature you control. You gain life equal to the entering creature's mana value.",
      triggered: [
        {
          trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
          targets: [],
          effect: {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 1,
            upTo: 1,
            prompt: "Choose a creature",
            then: { kind: "gain-life", amount: { manaValueOf: "trigger-object" } },
          } as EffectSpec,
          resolve: null,
          text: "watch",
        },
      ],
    }),
  )
  .register(
    spell(KEEPER, ["creature"], {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        {
          kind: "choose-permanents",
          filter: { type: "land", controlledBy: "you" },
          min: 1,
          upTo: 1,
          prompt: "Choose a land",
          keepTargets: true,
          then: { kind: "gain-life", amount: { countersOn: 1 } },
        } as EffectSpec,
      ],
    }),
  )
  .register(
    spell(READER, ["creature"], {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        {
          kind: "conditional",
          condition: { kind: "amounts", left: { countersOn: 0 }, op: "gte", right: 1 },
          then: { kind: "gain-life", amount: 5 },
        },
      ],
    }),
  )
  .register(
    defineCard({
      name: EXILER,
      manaCost: "{0}",
      types: ["artifact"],
      text: "{T}: Exile this artifact and all creatures.",
      activated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "exile-all", filter: { anyOf: [{ isSource: true }, { type: "creature" }] } },
          resolve: null,
          text: "{T}: Exile this artifact and all creatures.",
        },
      ],
    }),
  )
  .register(
    spell(IMPULSE, ["opponent"], {
      kind: "impulse-exile",
      amount: 1,
      whose: 0,
      duration: "while-exiled",
      play: true,
      gate: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
    } as EffectSpec),
  )
  .register(
    defineCard({
      name: TAPPER,
      manaCost: "{0}",
      types: ["artifact"],
      text: "{T}: Gain control of target creature for as long as this remains tapped.",
      activated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSourceTapped: true } as EffectSpec,
          resolve: null,
          text: "{T}: Gain control.",
        },
      ],
    }),
  );

describe("a choose-permanents' then", () => {
  it("reads the trigger that asked", () => {
    const { game, a } = table({ registry });
    spawn(game, WATCHER);
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    enter(game, "Grizzly Bears");
    expect(game.state.players[A].life).toBe(22);
  });

  it("reads a kept target where it was (rule 608.2h)", () => {
    const { game, a } = table({ registry });
    spawn(game, "Wastes");
    const victim = spawn(game, "Grizzly Bears", B);
    game.state.objects[victim].counters.charge = 3;
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, KEEPER), { targets: [{ kind: "object", object: victim }] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(game.state.players[A].life).toBe(23);
  });
});

describe("an amounts condition", () => {
  it("reads a destroyed target as it last existed", () => {
    const { game } = table({ registry });
    const victim = spawn(game, "Grizzly Bears", B);
    game.state.objects[victim].counters.charge = 3;
    cast(game, toHand(game, READER), { targets: [{ kind: "object", object: victim }] });
    expect(game.state.players[A].life).toBe(25);
  });
});

describe("isSource in a mass effect's filter", () => {
  it("is the object the effect is from", () => {
    const { game } = table({ registry });
    const exiler = spawn(game, EXILER);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, exiler, 0);
    expect(zone(game, exiler)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("an impulse permission's gate", () => {
  const exiledPlays = (game: ReturnType<typeof table>["game"]) =>
    game.legalActions(A).filter((o) => o.kind === "play-land" && game.state.objects[o.card].owner === B);

  it("reads the player who holds it, not the card's owner", () => {
    const { game } = table({ registry });
    spawn(game, "Sol Ring");
    toLibrary(game, "Wastes", B);
    cast(game, toHand(game, IMPULSE), { targets: [{ kind: "player", player: B }] });
    expect(exiledPlays(game)).toHaveLength(1);
  });

  it("isn't met by what the card's owner controls", () => {
    const { game } = table({ registry });
    spawn(game, "Sol Ring", B);
    toLibrary(game, "Wastes", B);
    cast(game, toHand(game, IMPULSE), { targets: [{ kind: "player", player: B }] });
    expect(exiledPlays(game)).toHaveLength(0);
  });
});

describe("for as long as this remains tapped (rule 611.2b)", () => {
  it("ends at the untap, even if it's tapped again at once", () => {
    const { game } = table({ registry });
    const tapper = spawn(game, TAPPER);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, tapper, 0, { targets: [{ kind: "object", object: bears }] });
    expect(game.state.objects[bears].controller).toBe(A);
    const self = [{ kind: "object", object: tapper }] as const;
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [...self]);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [...self]);
    expect(game.state.objects[tapper].tapped).toBe(true);
    expect(game.state.objects[bears].controller).toBe(B);
  });
});
