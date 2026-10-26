/**
 * Coldsnap (CSP), group D: a lord over every player's Soldiers, a snow-gated
 * counter for an activated ability, an end-of-combat counter from blocking a
 * flier, cumulative upkeep paid in snow mana and in either of two colours, ice
 * counters that hold creatures tapped, a noncreature-damage lifelink, and a
 * granted pump ability.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("CSP group D", () => {
  it("Field Marshal pumps every other Soldier, an opponent's too, not itself", () => {
    const { game } = table();
    const mine = spawn(game, "Field Marshal");
    const theirs = spawn(game, "Field Marshal", B);
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, theirs).has("first-strike")).toBe(true);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Perilous Research draws two, then sacrifices a permanent of the caster's choice", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const research = toHand(game, "Perilous Research");
    const before = hand(game).length;
    let offered: readonly string[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [bears];
    };
    cast(game, research);
    expect(offered).toContain(bears);
    expect(offered.length).toBe(3);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Rimewind Cryomancer counters an activated ability, only with four snow permanents", () => {
    const { game } = table();
    const cryo = spawn(game, "Rimewind Cryomancer");
    const centaur = spawn(game, "Boreal Centaur");
    lands(game, "Snow-Covered Island", 2);
    // Boreal Centaur and two snow lands: three snow permanents.
    activate(game, centaur, 0, { settle: false });
    const pump = game.state.zones.shared.stack[0];
    expect(() => activate(game, cryo, 0, { targets: [ref(pump)], settle: false })).toThrow();
    settle(game);
    expect(pt(game, centaur)).toEqual({ power: 3, toughness: 3 });

    const { game: g2 } = table();
    const cryo2 = spawn(g2, "Rimewind Cryomancer");
    const centaur2 = spawn(g2, "Boreal Centaur");
    lands(g2, "Snow-Covered Island", 3);
    activate(g2, centaur2, 0, { settle: false });
    const pump2 = g2.state.zones.shared.stack[0];
    activate(g2, cryo2, 0, { targets: [ref(pump2)] });
    expect(pt(g2, centaur2)).toEqual({ power: 2, toughness: 2 });
    // Once each turn: the countered activation still counts.
    expect(() => activate(g2, centaur2, 0)).toThrow();
  });

  it("Frostweb Spider gets its counter at end of combat after blocking a flier", () => {
    const { game, a, b } = table();
    const spider = spawn(game, "Frostweb Spider");
    nextTurn(game);
    const drake = spawn(game, "Wind Drake", B);
    a.declareBlockersFn = () => [{ blocker: spider, attacker: drake }];
    attack(game, b, [drake], A);
    expect(zone(game, spider)).toBe("battlefield");
    expect(counters(game, spider)).toBe(1);
    expect(pt(game, spider)).toEqual({ power: 2, toughness: 4 });
  });

  it("Frostweb Spider gets nothing for blocking a creature without flying", () => {
    const { game, a, b } = table();
    const spider = spawn(game, "Frostweb Spider");
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareBlockersFn = () => [{ blocker: spider, attacker: bears }];
    attack(game, b, [bears], A);
    expect(counters(game, spider)).toBe(0);
  });

  it("Glacial Plating's upkeep is paid in snow mana and grows the creature +3/+3 per age counter", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const plating = toHand(game, "Glacial Plating");
    cast(game, plating, { targets: [ref(bears)] });
    expect(game.state.objects[plating].attachedTo).toBe(bears);
    lands(game, "Snow-Covered Plains", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, plating, "age")).toBe(1);
    expect(zone(game, plating)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    // Two age counters, one snow source: the Plains can't pay {S}.
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, plating)).toBe("graveyard");
  });

  it("Earthen Goo's cumulative upkeep takes {R} or {G} per age counter", () => {
    const { game, a } = table();
    const goo = spawn(game, "Earthen Goo");
    game.state.objects[goo].counters.age = 1;
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    // Two age counters: one paid with {R}, one with {G}.
    expect(zone(game, goo)).toBe("battlefield");
    expect(counters(game, goo, "age")).toBe(2);
    expect(pt(game, goo)).toEqual({ power: 4, toughness: 4 });
  });

  it("Rimescale Dragon taps a creature with an ice counter, and it stays tapped", () => {
    const { game } = table();
    const dragon = spawn(game, "Rimescale Dragon");
    lands(game, "Snow-Covered Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, dragon, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "ice")).toBe(1);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Freyalise's Radiance keeps snow permanents from untapping, not others", () => {
    const { game } = table();
    spawn(game, "Freyalise's Radiance");
    const snow = spawn(game, "Snow-Covered Forest", A, { tapped: true });
    const plain = spawn(game, "Forest", A, { tapped: true });
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[snow].tapped).toBe(true);
    expect(game.state.objects[plain].tapped).toBe(false);
  });

  it("Tamanoa gains life from a noncreature source's damage, not a creature's", () => {
    const { game, a } = table();
    spawn(game, "Tamanoa");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(23);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(15);
    expect(life(game)).toBe(23);
    expect(graveyard(game)).toContain(bolt);
  });

  it("Greater Stone Spirit gives +0/+2 and a {R} pump for the turn", () => {
    const { game } = table();
    const spirit = spawn(game, "Greater Stone Spirit");
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, spirit, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 4 });
    const offer = game.legalActions(A).find((x) => x.kind === "activate-ability" && x.source === bears);
    if (offer?.kind !== "activate-ability") throw new Error("not offered");
    activate(game, bears, offer.abilityIndex);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "precombat-main");
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === bears)).toBe(false);
  });
});
