/**
 * Commander Masters (CMM) set batch 1 — the set's last authorable cards.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, enter, lands, life, pickTargets, pt, settle, spawn, subtypes, table, toHand, toStep, zone } from "./harness.js";

describe("Commander Masters batch 1", () => {
  it("Lazotep Sliver: Slivers have afflict 2; a nontoken Sliver dying amasses Slivers 2", () => {
    const { game, a, b } = table();
    spawn(game, "Lazotep Sliver");
    const sliver = spawn(game, "Capricious Sliver");
    const blocker = spawn(game, "Hill Giant", B);
    a.declareAttackersFn = () => [{ attacker: sliver, defender: B }];
    b.declareBlockersFn = () => [{ blocker, attacker: sliver }];
    const before = life(game, B);
    toStep(game, "postcombat-main");
    settle(game);
    // Afflict: 2 life as it became blocked.
    expect(life(game, B)).toBe(before - 2);
    // The 3/3 Capricious Sliver traded with the Hill Giant: a Sliver Army
    // with two +1/+1 counters.
    expect(zone(game, sliver)).toBe("graveyard");
    const army = game.state.zones.shared.battlefield.find((id) => subtypes(game, id).includes("Army"));
    expect(army).toBeDefined();
    expect(subtypes(game, army!)).toContain("Sliver");
    expect(game.state.objects[army!].counters["+1/+1"]).toBe(2);
  });

  it("Regal Sliver: a Sliver entering makes you the monarch; the next one, with you the monarch, pumps your Slivers", () => {
    const { game } = table();
    const regal = enter(game, "Regal Sliver");
    expect(game.state.monarch).toBe(A);
    expect(pt(game, regal)).toEqual({ power: 3, toughness: 3 });
    enter(game, "Capricious Sliver");
    expect(pt(game, regal)).toEqual({ power: 4, toughness: 4 });
  });

  it("Taunting Sliver: a Sliver entering goads a creature an opponent controls", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Hill Giant", B);
    pickTargets(a, theirs);
    enter(game, "Taunting Sliver");
    expect(game.state.objects[theirs].goadedBy).toContain(A);
  });

  it("Gatewatch Beacon: enters with three loyalty counters and may move one onto a planeswalker that enters", () => {
    const { game, a } = table();
    const beacon = enter(game, "Gatewatch Beacon");
    expect(game.state.objects[beacon].counters.loyalty).toBe(3);
    a.chooseModesFn = () => [0];
    const walker = enter(game, "Ajani, Caller of the Pride");
    expect(game.state.objects[beacon].counters.loyalty).toBe(2);
    expect(game.state.objects[walker].counters.loyalty).toBe(5);
  });

  it("Nyxborn Behemoth: {X} less, X the total mana value of noncreature enchantments you control", () => {
    const { game } = table();
    // Two Banishing Lights, mana value 3 each: {10}{G}{G} less 6 is {4}{G}{G}.
    spawn(game, "Banishing Light");
    spawn(game, "Banishing Light");
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Nyxborn Behemoth"));
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Nyxborn Behemoth")).toBe(true);
  });

  it("Nyxborn Behemoth: 'another enchantment' — it can't sacrifice itself", () => {
    const { game } = table();
    const behemoth = spawn(game, "Nyxborn Behemoth");
    lands(game, "Forest", 2);
    const offered = () =>
      game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === behemoth);
    expect(offered()).toBe(false);
    spawn(game, "Banishing Light");
    expect(offered()).toBe(true);
  });
});
