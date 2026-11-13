/**
 * "Shares a creature type with a member of a set", read by types alone
 * (`TypeShareReference`'s `{ typesOf }`) and with **each** member (`each`):
 * Everything Comes to Dust's "except those that share a creature type with a
 * creature that convoked this spell" (the `"convokers"` set, rule 702.51a),
 * and Cryptic Gateway's "a creature card … that shares a creature type with
 * each creature tapped this way". A reference with no creature type shares
 * none, even with itself (rule 205.3m); one that has left is read as it last
 * existed (608.2h).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { A, B, cast, lands, pickFromZone, settle, spawn, table, toHand, zone } from "./harness.js";

const creature = (name: string, subtypes: readonly string[], types: readonly ("creature" | "artifact" | "enchantment")[] = ["creature"]) =>
  defineCard({
    name,
    manaCost: "{1}",
    types,
    ...(subtypes.length > 0 ? { subtypes } : {}),
    power: 1,
    toughness: 1,
    text: "",
  });

const registry = createDefaultRegistry()
  .register(creature("Test Elf Wizard", ["Elf", "Wizard"]))
  .register(creature("Test Human Warrior", ["Human", "Warrior"]))
  .register(creature("Test Elf Warrior", ["Elf", "Warrior"]))
  .register(creature("Test Elf Druid", ["Elf", "Druid"]))
  .register(creature("Test Human Wizard", ["Human", "Wizard"]))
  .register(creature("Test Bear", ["Bear"]))
  .register(creature("Test Typeless", []))
  .register(creature("Test Elf Construct", ["Elf", "Construct"], ["artifact", "creature"]));

const DUST = "Everything Comes to Dust";

/** Cast Everything Comes to Dust with nine Plains and `convokers` paying {1}
 * each. */
function castDust(game: ReturnType<typeof table>["game"], convokers: readonly string[], opts: { settle?: boolean } = {}) {
  lands(game, "Plains", 10 - convokers.length);
  const payers = convokers.map((name) => spawn(game, name));
  const card = toHand(game, DUST);
  cast(game, card, { convoke: payers.map((creature) => ({ creature, pays: "generic" as const })), settle: opts.settle ?? true });
  return { card, payers };
}

describe("Everything Comes to Dust: creatures sharing a type with a convoker stay", () => {
  it("exiles every creature but the convoker's kin, either side, and every artifact and enchantment", () => {
    const { game } = table({ registry });
    const kin = spawn(game, "Test Elf Druid");
    const theirKin = spawn(game, "Test Elf Warrior", B);
    const bear = spawn(game, "Test Bear", B);
    const artifactKin = spawn(game, "Test Elf Construct");
    const anthem = spawn(game, "Glorious Anthem", B);
    const ring = spawn(game, "Sol Ring");
    const { card, payers } = castDust(game, ["Test Elf Wizard"]);
    expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, payers[0])).toBe("battlefield");
    expect(zone(game, kin)).toBe("battlefield");
    expect(zone(game, theirKin)).toBe("battlefield");
    expect(zone(game, bear)).toBe("exile");
    // An artifact creature sharing a type is still one of "all artifacts".
    expect(zone(game, artifactKin)).toBe("exile");
    expect(zone(game, anthem)).toBe("exile");
    expect(zone(game, ring)).toBe("exile");
  });

  it("a convoker with no creature type shares none, not even with itself", () => {
    const { game } = table({ registry });
    const bear = spawn(game, "Test Bear");
    const { payers } = castDust(game, ["Test Typeless", "Test Bear"]);
    expect(zone(game, payers[0])).toBe("exile");
    expect(zone(game, payers[1])).toBe("battlefield");
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("cast without convoke, nothing shares: every creature goes", () => {
    const { game } = table({ registry });
    const elf = spawn(game, "Test Elf Druid");
    castDust(game, []);
    expect(zone(game, elf)).toBe("exile");
  });

  it("a convoker gone before it resolves is read as it last existed (608.2h)", () => {
    const { game } = table({ registry });
    const kin = spawn(game, "Test Elf Druid");
    const bear = spawn(game, "Test Bear");
    const { payers } = castDust(game, ["Test Elf Wizard"], { settle: false });
    game.debugMove(payers[0], "graveyard");
    settle(game);
    expect(zone(game, kin)).toBe("battlefield");
    expect(zone(game, bear)).toBe("exile");
  });
});

describe("Cryptic Gateway: a creature card sharing a creature type with each tapped creature", () => {
  it("offers an Elf Warrior and a Human Wizard for an Elf Wizard and a Human Warrior, not an Elf Druid", () => {
    const { game, a } = table({ registry });
    const gateway = spawn(game, "Cryptic Gateway");
    const wizard = spawn(game, "Test Elf Wizard");
    const warrior = spawn(game, "Test Human Warrior");
    const elfWarrior = toHand(game, "Test Elf Warrior");
    const humanWizard = toHand(game, "Test Human Wizard");
    const druid = toHand(game, "Test Elf Druid");
    const bear = toHand(game, "Test Bear");
    const seen = pickFromZone(a, elfWarrior);
    game.dispatch({ type: "activate-ability", player: A, source: gateway, abilityIndex: 0, targets: [], tap: [wizard, warrior] });
    settle(game);
    expect([...seen.offered].sort()).toEqual([elfWarrior, humanWizard].sort());
    expect(seen.offered).not.toContain(druid);
    expect(seen.offered).not.toContain(bear);
    expect(zone(game, elfWarrior)).toBe("battlefield");
    expect(game.state.objects[wizard].tapped).toBe(true);
    expect(game.state.objects[warrior].tapped).toBe(true);
  });

  it("a typeless tapped creature leaves nothing to put", () => {
    const { game, a } = table({ registry });
    const gateway = spawn(game, "Cryptic Gateway");
    const wizard = spawn(game, "Test Elf Wizard");
    const blank = spawn(game, "Test Typeless");
    const elfWarrior = toHand(game, "Test Elf Warrior");
    const seen = pickFromZone(a);
    game.dispatch({ type: "activate-ability", player: A, source: gateway, abilityIndex: 0, targets: [], tap: [wizard, blank] });
    settle(game);
    expect(seen.offered).toEqual([]);
    expect(zone(game, elfWarrior)).toBe("hand");
  });
});
