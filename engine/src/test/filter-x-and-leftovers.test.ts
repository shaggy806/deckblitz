/**
 * Small things authoring passes found: a bare `n: "x"` read wherever an
 * effect's filter is applied, `reveal: "chosen"` from a hand, a prompt-only
 * `each-player-may`, and `sameNameAsSource` reading a source that has left
 * (rules 113.7a, 608.2h).
 */
import { describe, expect, it } from "vitest";

import { defineCard, type CardDefinition } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { EffectSpec } from "../effects.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, loyalty, settle, spawn, table, toExile, toHand, zone } from "./harness.js";

const NOTHING = { mana: null, tap: false } as const;

const walker = (name: string, effect: EffectSpec): CardDefinition =>
  defineCard({
    name,
    manaCost: "{0}",
    types: ["planeswalker"],
    loyalty: 9,
    text: `−X: ${name}.`,
    activated: [{ loyaltyCost: "-x", cost: NOTHING, targets: [], effect, resolve: null, text: `−X: ${name}.` }],
  });

const EXILER = "Test Walker Exile X";
const DAMAGER = "Test Walker Mass Tap X";
const PICKER = "Test Walker Pick X";
const SHOWER = "Test Sorcery Reveal From Hand";
const ASKER = "Test Sorcery Prompt Only";
const TWIN = "Test Twin";

const registry = createDefaultRegistry()
  .register(
    walker(EXILER, {
      kind: "exile-all",
      filter: { type: "creature", manaValue: { op: "lte", n: "x" } },
    }),
  )
  .register(
    walker(DAMAGER, {
      kind: "tap-all",
      filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
    } as EffectSpec),
  )
  .register(
    walker(PICKER, {
      kind: "look-and-choose",
      zone: "exiled-with-source",
      min: 0,
      max: 1,
      filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
      destination: "hand",
      leftover: "stay",
    }),
  )
  .register(
    defineCard({
      name: SHOWER,
      manaCost: "{0}",
      types: ["sorcery"],
      text: "You may reveal a creature card from your hand and put it on the bottom of your library.",
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "library-bottom",
        leftover: "stay",
        reveal: "chosen",
      },
      resolve: null,
    }),
  )
  .register(
    defineCard({
      name: ASKER,
      manaCost: "{0}",
      types: ["sorcery"],
      text: "Each player may say yes. For each who does, that player gains 1 life.",
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Say yes?",
        ifDid: { kind: "gain-life", amount: 1, who: "that-player" } as EffectSpec,
        ifDidnt: { kind: "lose-life", amount: 1, who: "that-player" } as EffectSpec,
      },
      resolve: null,
    }),
  )
  .register(
    defineCard({
      name: TWIN,
      manaCost: "{0}",
      types: ["creature"],
      subtypes: ["Shapeshifter"],
      power: 1,
      toughness: 1,
      text: "{T}: Destroy all other creatures with the same name as this creature.",
      activated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "destroy-all", filter: { type: "creature", sameNameAsSource: true } },
          resolve: null,
          text: "{T}: Destroy all other creatures with the same name as this creature.",
        },
      ],
    }),
  );

const events = (game: ReturnType<typeof table>["game"]) => game.state.eventLog;

describe("a bare X in an effect's filter is the X of what's resolving", () => {
  it("exile-all on a −X ability", () => {
    const { game } = table({ registry });
    const walkerId = spawn(game, EXILER);
    const two = spawn(game, "Grizzly Bears", B);
    const five = spawn(game, "Craw Wurm", B);
    loyalty(game, walkerId, "-x", { x: 2 });
    settle(game);
    expect(zone(game, two)).toBe("exile");
    expect(zone(game, five)).toBe("battlefield");
  });

  it("any other mass effect's filter", () => {
    const { game } = table({ registry });
    const walkerId = spawn(game, DAMAGER);
    const two = spawn(game, "Grizzly Bears", B);
    const five = spawn(game, "Craw Wurm", B);
    loyalty(game, walkerId, "-x", { x: 2 });
    settle(game);
    expect(game.state.objects[two].tapped).toBe(true);
    expect(game.state.objects[five].tapped).toBe(false);
  });

  it("look-and-choose on a −X ability", () => {
    const { game, a } = table({ registry });
    const walkerId = spawn(game, PICKER);
    const stint = game.state.objects[walkerId].zoneChangeCount ?? 0;
    const bears = toExile(game, "Grizzly Bears");
    game.state.objects[bears].exiledWith = { source: walkerId, zoneChangeCount: stint };
    const seen: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      seen.push(eligible);
      return eligible.slice(0, 1);
    };
    loyalty(game, walkerId, "-x", { x: 2 });
    settle(game);
    expect(seen.length).toBe(1);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("reveal: chosen from a hand", () => {
  it("shows the cards taken, from the hand", () => {
    const { game, a } = table({ registry });
    const bears = toHand(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, SHOWER));
    const revealed = events(game).filter((e) => e.type === "cards-revealed");
    expect(revealed).toHaveLength(1);
    expect(revealed[0]).toMatchObject({ player: A, objects: [bears], from: "hand" });
  });
});

describe("an each-player-may with only a prompt", () => {
  it("asks everyone, and each answer counts", () => {
    const { game, a, b } = table({ registry });
    // Alice says yes, Bob no.
    a.chooseModesFn = (_view, _min, _max, modes) => modes.map((_, i) => i).slice(0, 1);
    b.chooseModesFn = () => [];
    cast(game, toHand(game, ASKER));
    expect(game.state.players[A].life).toBe(21);
    expect(game.state.players[B].life).toBe(19);
  });
});

describe("the same name as a source that has left (rules 113.7a, 608.2h)", () => {
  it("is the name it last had, not its name in the graveyard", () => {
    const { game } = table({ registry });
    const other = spawn(game, TWIN, B);
    // A copy of the Twin: a Grizzly Bears again in the graveyard.
    const clone = spawn(game, "Grizzly Bears");
    game.state.objects[clone].copyOf = TWIN;
    activate(game, clone, 0, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: clone }]);
    settle(game);
    expect(zone(game, clone)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
  });
});
