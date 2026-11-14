/**
 * "Each player shuffles all permanents they own into their library, then
 * reveals that many cards from the top of their library. Each player puts
 * all artifact, creature, and land cards revealed this way onto the
 * battlefield, then does the same for enchantment cards, then puts all cards
 * revealed this way that weren't put onto the battlefield on the bottom of
 * their library" (Warp World; Glimpse of Tomorrow): `shuffle-graveyard-into-
 * library`'s `revealThatMany`. A token counts toward "that many" (the
 * rulings); each group enters at once across every player; an Aura chooses
 * its host among what's already there (rule 303.4f); the rest go on the
 * bottom, ordered by their owner (rule 401.4) or at random.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, ref, registryOf, spawn, table, toHand, toLibrary, tokensNamed, zone } from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Empty both libraries, so what's revealed is exactly what was shuffled in. */
function emptyLibraries(game: Game): void {
  for (const p of [A, B]) for (const id of [...library(game, p)]) game.debugMove(id, "exile");
}

function attach(game: Game, aura: ObjectId, host: ObjectId): void {
  game.debugApplyEffect(A, { kind: "attach", attachment: 0, target: 1 }, [ref(aura), ref(host)]);
  expect(game.state.objects[aura].attachedTo).toBe(host);
}

/** Every battlefield entry since `since`, one event each. */
const entries = (game: Game, since: number): number =>
  game.state.eventLog.filter((e) => e.seq >= since && e.type === "permanent-entered-battlefield").length;

describe("shuffle permanents in, reveal that many", () => {
  it("Warp World: lands and creatures first, then enchantments (an Aura among what's there), the rest on the bottom", () => {
    const { game, a } = table();
    emptyLibraries(game);
    const mountains = lands(game, "Mountain", 8);
    const warp = toHand(game, "Warp World");
    const bears = spawn(game, "Grizzly Bears");
    const anthem = spawn(game, "Glorious Anthem");
    const pacifism = spawn(game, "Pacifism");
    const giant = spawn(game, "Hill Giant", B);
    attach(game, pacifism, giant);
    const forest = spawn(game, "Forest", B);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    expect(tokensNamed(game, "Soldier Token")).toBe(1);
    // An instant already in Alice's library: one of the cards she reveals,
    // since she counts one more (the token) than the cards she shuffles in.
    const shock = toLibrary(game, "Shock");
    let offered: readonly ObjectId[] = [];
    let anthemThen = "";
    a.chooseEnchantFn = (_view, _source, options) => {
      offered = options;
      anthemThen = zone(game, anthem);
      return giant;
    };
    cast(game, warp);
    // Every permanent card came back; the token ceased to exist (rule 111.7).
    for (const id of [...mountains, bears, anthem, pacifism, giant, forest]) expect(zone(game, id)).toBe("battlefield");
    expect(tokensNamed(game, "Soldier Token")).toBe(0);
    // The Aura chose among what was already back — both players' creatures —
    // while the other enchantment entering with it was still in the library.
    expect(offered).toContain(giant);
    expect(offered).toContain(bears);
    expect(anthemThen).toBe("library");
    expect(game.state.objects[pacifism].attachedTo).toBe(giant);
    // The Shock was revealed and went to the bottom.
    expect(library(game)).toEqual([shock]);
  });

  it("Warp World: every player's enchantments enter after every player's other permanents", () => {
    const { game } = table();
    emptyLibraries(game);
    lands(game, "Mountain", 8);
    const warp = toHand(game, "Warp World");
    const anthem = spawn(game, "Glorious Anthem");
    const bears = spawn(game, "Grizzly Bears", B);
    const since = game.state.eventSeq;
    cast(game, warp);
    expect(entries(game, since)).toBe(10);
    const at = (id: ObjectId): number =>
      game.state.eventLog.findIndex((e) => e.seq >= since && e.type === "permanent-entered-battlefield" && e.object === id);
    expect(at(anthem)).toBeGreaterThan(at(bears));
  });

  it("Warp World: a player reveals only as many as they counted", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const warp = toHand(game, "Warp World");
    spawn(game, "Grizzly Bears", B);
    const before = library(game, B).length;
    cast(game, warp);
    // Bob owned one permanent: he revealed one card from a library of Wastes
    // and the Bears — whichever it was, a land or a creature, it entered.
    const bobs = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].owner === B);
    expect(bobs).toHaveLength(1);
    expect(library(game, B).length).toBe(before);
  });

  it("Glimpse of Tomorrow: only your permanents; the non-Auras, then the Auras, the rest at random", () => {
    // Its spell's effect, on a spell cast from the hand: the suspended card
    // cast for free resolves the same way, and a resolution can stop to ask.
    const { game, a } = table({ ownRegistry: true });
    const effect = registryOf(game).get("Glimpse of Tomorrow").effect;
    if (effect === undefined || effect === null) throw new Error("Glimpse of Tomorrow has no effect");
    game.registry.register(
      defineCard({ name: "Glimpse Test Spell", manaCost: "{R}", colors: ["R"], types: ["sorcery"], text: "", effect }),
    );
    emptyLibraries(game);
    const mountain = lands(game, "Mountain", 1)[0];
    const glimpse = toHand(game, "Glimpse Test Spell");
    const bears = spawn(game, "Grizzly Bears");
    const rancor = spawn(game, "Rancor");
    attach(game, rancor, bears);
    const giant = spawn(game, "Hill Giant", B);
    const shock = toLibrary(game, "Shock");
    const bolt = toLibrary(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    let offered: readonly ObjectId[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      offered = options;
      return bears;
    };
    const giantStint = game.state.objects[giant].zoneChangeCount;
    cast(game, glimpse);
    // Bob's Hill Giant never left.
    expect(game.state.objects[giant].zoneChangeCount).toBe(giantStint);
    // Alice counted five (two tokens) and revealed all five of her cards.
    expect(zone(game, mountain)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, rancor)).toBe("battlefield");
    expect(offered).toContain(bears);
    expect(game.state.objects[rancor].attachedTo).toBe(bears);
    expect([...library(game)].sort()).toEqual([shock, bolt].sort());
  });
});
