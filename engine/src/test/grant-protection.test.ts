/**
 * Protection granted for a while (rule 702.16 — the `grant-protection`
 * effect): a fixed quality, or one chosen as the effect resolves — "the color
 * of your choice", "colorless or the color of your choice", "the card type of
 * your choice" — asked as a `choose-modes` decision; on the target, and on
 * every permanent a filter reaches as it resolves (rule 611.2c), all with one
 * timestamp. And the static "protection from the chosen color" of an Aura
 * that names its colour as it enters, which "doesn't remove this Aura" (rule
 * 702.16n).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { effectWorth } from "../effect-worth.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { protectionBlocks } from "../targeting.js";
import { A, B, activate, cast, lands, nextTurn, pickModes, pickTargets, ref, registryOf, spawn, table, toHand, zone } from "./harness.js";

const protectedFrom = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).protectionFrom.colors].sort();
/** `source` deals 2 damage to `target`. */
const ping = (game: Game, source: ObjectId, target: ObjectId): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount: 2, target: 0 }, [ref(target)], {
    source,
  });

describe("grant-protection: the color of your choice", () => {
  it("Gods Willing asks for the colour as it resolves and protects until end of turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [3];
    };
    cast(game, toHand(game, "Gods Willing"), { targets: [ref(bears)] });
    expect(offered).toEqual([
      "Protection from white",
      "Protection from blue",
      "Protection from black",
      "Protection from red",
      "Protection from green",
    ]);
    expect(protectedFrom(game, bears)).toEqual(["R"]);
    // Every seat sees it on the permanent, in words.
    expect(game.viewFor(B).objects[bears].text).toContain("Protection from red until end of turn");
    const goblin = spawn(game, "Raging Goblin", B);
    ping(game, goblin, bears);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    nextTurn(game);
    expect(game.viewFor(B).objects[bears].text).not.toContain("Protection from red");
    expect(protectedFrom(game, bears)).toEqual([]);
  });

  it("Giver of Runes offers colorless first, and colorless stops a colorless source", () => {
    const { game, a } = table();
    const giver = spawn(game, "Giver of Runes");
    const bears = spawn(game, "Grizzly Bears");
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [0];
    };
    activate(game, giver, 0, { targets: [ref(bears)] });
    expect(offered[0]).toBe("Protection from colorless");
    expect(offered).toHaveLength(6);
    const golem = spawn(game, "Ornithopter", B);
    expect(protectionBlocks(game.state, registryOf(game), bears, { colors: new Set(), types: ["artifact", "creature"], object: golem })).toBe(true);
    const goblin = spawn(game, "Raging Goblin", B);
    ping(game, goblin, bears);
    expect(game.state.objects[bears].damageMarked).toBe(2);
  });

  it("Giver of Runes can't target itself (another target creature)", () => {
    const { game } = table();
    const giver = spawn(game, "Giver of Runes");
    expect(() => activate(game, giver, 0, { targets: [ref(giver)] })).toThrow();
  });

  it("Pippin offers the nine card types", () => {
    const { game, a } = table();
    const pippin = spawn(game, "Pippin, Guard of the Citadel");
    const bears = spawn(game, "Grizzly Bears");
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [0];
    };
    activate(game, pippin, 0, { targets: [ref(bears)] });
    expect(offered).toHaveLength(9);
    expect(offered[0]).toBe("Protection from artifacts");
    expect([...computeCharacteristics(game.state, registryOf(game), bears).protectionFrom.types]).toEqual(["artifact"]);
  });
});

describe("grant-protection over a filter", () => {
  it("Brave the Elements reaches white creatures you control as it resolves, not later ones", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const knight = spawn(game, "White Knight");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "White Knight", B);
    cast(game, toHand(game, "Brave the Elements"));
    // The scripted default takes the first mode: white.
    expect(protectedFrom(game, knight)).toEqual(["B", "W"]);
    expect(protectedFrom(game, bears)).toEqual([]);
    expect(protectedFrom(game, theirs)).toEqual(["B"]);
    const later = spawn(game, "White Knight");
    expect(protectedFrom(game, later)).toEqual(["B"]);
  });

  it("Bathe in Light reaches the target and each other creature sharing a colour with it", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    const knight = spawn(game, "White Knight");
    pickModes(a, 3);
    cast(game, toHand(game, "Bathe in Light"), { targets: [ref(bears)] });
    expect(protectedFrom(game, bears)).toEqual(["R"]);
    expect(protectedFrom(game, elves)).toEqual(["R"]);
    expect(protectedFrom(game, knight)).toEqual(["B"]);
  });

  it("Crypsis: protection from creatures the caster's opponents control, fixed as it resolves", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Raging Goblin", B);
    const ours = spawn(game, "Raging Goblin");
    cast(game, toHand(game, "Crypsis"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    ping(game, theirs, bears);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    ping(game, ours, bears);
    expect(game.state.objects[bears].damageMarked).toBe(2);
    // Bob gaining control of alice's bears changes nothing: it's still bob's
    // goblin it's protected from.
    game.state.objects[bears].controller = B;
    game.state.objects[bears].damageMarked = 0;
    ping(game, theirs, bears);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("a fixed quality: Crimson Acolyte gives protection from red", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const acolyte = spawn(game, "Crimson Acolyte");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, acolyte, 0, { targets: [ref(bears)] });
    expect(protectedFrom(game, bears)).toEqual(["R"]);
  });
});

describe("protection from the chosen color (an Aura's, rule 702.16n)", () => {
  it("Flickering Ward naming its own colour stays on; another white Aura falls off", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseCreatureTypeFn = () => "W";
    pickTargets(a, bears);
    const ward = toHand(game, "Flickering Ward");
    cast(game, ward, { targets: [ref(bears)] });
    expect(zone(game, ward)).toBe("battlefield");
    expect(game.state.objects[ward].attachedTo).toBe(bears);
    expect(protectedFrom(game, bears)).toEqual(["W"]);
    // It still stops a white source's damage.
    const knight = spawn(game, "White Knight");
    ping(game, knight, bears);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    // Another white Aura can't enchant it.
    const pacifism = toHand(game, "Pacifism");
    expect(() => cast(game, pacifism, { targets: [ref(bears)] })).toThrow();
  });

  it("another instance of the same quality removes it as normal", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    a.chooseCreatureTypeFn = () => "W";
    const ward = toHand(game, "Flickering Ward");
    cast(game, ward, { targets: [ref(bears)] });
    expect(zone(game, ward)).toBe("battlefield");
    game.debugApplyEffect(A, { kind: "grant-protection", target: 0, from: { colors: ["W"] }, duration: "end-of-turn" }, [ref(bears)]);
    // State-based actions are checked as the turn moves on (704.5m).
    nextTurn(game);
    expect(zone(game, ward)).toBe("graveyard");
  });
});

describe("the bot's colour", () => {
  it("v1 names the colour of the opposing spell aimed at its creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1, B);
    // Bob's Lightning Bolt at alice's bears, on the stack.
    game.dispatch({ type: "pass-priority", player: A });
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(bears)], settle: false });
    expect(game.state.zones.shared.stack).toContain(bolt);
    const mode = (colors: readonly ("W" | "R")[]): EffectSpec => ({
      kind: "grant-protection",
      target: 0,
      from: { colors },
      duration: "end-of-turn",
    });
    const ctx = { state: game.state, me: A, controller: A, targets: [ref(bears)], cards: registryOf(game) };
    expect(effectWorth(mode(["R"]), ctx)).toBeGreaterThan(effectWorth(mode(["W"]), ctx));
  });
});
