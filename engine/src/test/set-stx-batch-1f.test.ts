/**
 * Strixhaven: School of Mages, group f — the clauses most likely to be wrong
 * on each card that's more than a stat line or a copy of a tested pattern.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("STX group f", () => {
  it("Blot Out the Sky: X tapped Inklings; at X 6 noncreature, nonland permanents are destroyed", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Swamp", 4);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Blot Out the Sky"), { x: 6 });
    expect(tokensNamed(game, "Inkling Token", A)).toBe(6);
    const inkling = game.battlefield.find((id) => game.state.objects[id].cardName === "Inkling Token");
    expect(inkling !== undefined && game.state.objects[inkling].tapped).toBe(true);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Blot Out the Sky: below 6 nothing is destroyed", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 5);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Blot Out the Sky"), { x: 5 });
    expect(tokensNamed(game, "Inkling Token", A)).toBe(5);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("Callous Bloodmage: the third mode exiles target player's graveyard", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 2);
    pickTargets(a, B);
    enter(game, "Callous Bloodmage");
    expect(zone(game, card)).toBe("exile");
    expect(graveyard(game, B)).toHaveLength(0);
  });

  it("Lorehold Command: modes resolve in order — the Spirit gets +1/+0, indestructible and haste", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Lorehold Command"), { modes: [0, 1] });
    const [spirit] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Spirit Token (Red-White)");
    expect(pt(game, spirit)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, spirit).has("indestructible")).toBe(true);
    expect(keywords(game, spirit).has("haste")).toBe(true);
  });

  it("Lorehold Command: 3 damage to any target, target player gains 3, then sacrifice and draw two", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Lorehold Command"), { modes: [2, 3], targets: [ref(B), ref(A)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === A)).toHaveLength(4);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("Rowan, Scholar of Sparks: +1 deals 1 to each opponent with fewer than three cards drawn", () => {
    const { game } = table({ players: 3 });
    const rowan = spawn(game, "Rowan, Scholar of Sparks");
    // Turn 1's draw step drew one; one more makes two.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    loyalty(game, rowan, 1);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
  });

  it("Rowan, Scholar of Sparks: +1 deals 3 to each opponent once you've drawn three cards this turn", () => {
    const { game } = table({ players: 3 });
    const rowan = spawn(game, "Rowan, Scholar of Sparks");
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    loyalty(game, rowan, 1);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
  });

  it("Rowan's emblem copies an instant or sorcery for {2}", () => {
    const { game, a } = table();
    const rowan = spawn(game, "Rowan, Scholar of Sparks");
    loyalty(game, rowan, -4, { atLeast: 4 });
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });

  /** Will, cast as the back face of Rowan // Will. Its abilities by index:
   * 0 the +1, 1 the −3, 2 the −7. */
  const castWill = (game: ReturnType<typeof table>["game"]) => {
    lands(game, "Island", 5);
    const card = toHand(game, "Rowan, Scholar of Sparks");
    cast(game, card, { face: 1 });
    expect(game.state.objects[card].counters.loyalty).toBe(4);
    return card;
  };

  it("Will, Scholar of Frost: +1 sets base P/T 0/2 until your next turn", () => {
    const { game } = table();
    const will = castWill(game);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, will, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Will, Scholar of Frost: −7 exiles, and each exiled permanent's controller gets a 4/4 Elemental", () => {
    const { game } = table();
    const will = castWill(game);
    game.state.objects[will].counters.loyalty = 7;
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Sol Ring", B)];
    const mine = spawn(game, "Grizzly Bears", A);
    activate(game, will, 2, { targets: [ref(theirs[0]), ref(theirs[1]), ref(mine), null, null] });
    expect(theirs.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(zone(game, mine)).toBe("exile");
    expect(tokensNamed(game, "4/4 Blue Red Elemental Token", B)).toBe(2);
    expect(tokensNamed(game, "4/4 Blue Red Elemental Token", A)).toBe(1);
  });

  it("Rowan // Will: instant and sorcery spells cost {1} less", () => {
    const { game } = table();
    spawn(game, "Rowan, Scholar of Sparks");
    lands(game, "Island", 1);
    const div = toHand(game, "Divination");
    expect(() => cast(game, div)).toThrow();
    lands(game, "Island", 1);
    cast(game, div);
    expect(zone(game, div)).toBe("graveyard");
  });

  it("Tenured Inkcaster: a creature with a +1/+1 counter attacking drains each opponent for 1", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const inkcaster = enter(game, "Tenured Inkcaster");
    expect(counters(game, bears)).toBe(1);
    attack(game, a, [bears, inkcaster]);
    // Bears (3) and the Inkcaster (2) hit; only the countered Bears drains.
    expect(life(game, B)).toBe(20 - 1 - 3 - 2);
    expect(life(game, A)).toBe(21);
  });

  it("The Biblioplex: only with exactly zero or seven cards in hand", () => {
    const { game, a } = table();
    const bib = spawn(game, "The Biblioplex");
    lands(game, "Wastes", 2);
    expect(hand(game, A)).toHaveLength(8);
    expect(() => activate(game, bib, 1)).toThrow();
    game.dispatch({ type: "play-land", player: A, card: hand(game, A)[0] });
    expect(hand(game, A)).toHaveLength(7);
    const opt = toLibrary(game, "Opt");
    pickFromZone(a, opt);
    activate(game, bib, 1);
    expect(zone(game, opt)).toBe("hand");
  });

  it("Master Symmetrist: an attacker with power equal to toughness gains trample; another doesn't", () => {
    const { game, a } = table();
    spawn(game, "Master Symmetrist");
    const bears = spawn(game, "Grizzly Bears");
    const vanguard = spawn(game, "Elite Vanguard");
    attack(game, a, [bears, vanguard]);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, vanguard).has("trample")).toBe(false);
  });

  it("Thunderous Orator: gains only the listed keywords your creatures have", () => {
    const { game, a } = table();
    spawn(game, "Serra Angel");
    const orator = spawn(game, "Thunderous Orator");
    attack(game, a, [orator]);
    expect(keywords(game, orator).has("flying")).toBe(true);
    expect(keywords(game, orator).has("lifelink")).toBe(false);
  });

  it("Lorehold Apprentice: magecraft gives Spirits '{T}: 1 damage to each opponent' until end of turn", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Lorehold Apprentice");
    const spirit = spawn(game, "Spirit Token (Red-White)");
    const bears = spawn(game, "Grizzly Bears");
    const offered = (id: typeof spirit) =>
      game.legalActions(A).filter((x) => x.kind === "activate-ability" && x.source === id);
    expect(offered(spirit)).toHaveLength(0);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(offered(bears)).toHaveLength(0);
    const [ability] = offered(spirit);
    if (ability?.kind !== "activate-ability") throw new Error("not offered");
    activate(game, spirit, ability.abilityIndex);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
  });

  it("Prismari Apprentice: unblockable, and a counter for a spell with mana value 5 or more", () => {
    const { game } = table();
    const apprentice = spawn(game, "Prismari Apprentice");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(keywords(game, apprentice).has("unblockable")).toBe(true);
    expect(counters(game, apprentice)).toBe(0);
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Lorehold Command"), { modes: [0, 1] });
    expect(counters(game, apprentice)).toBe(1);
  });

  it("Silverquill Pledgemage: your choice of flying or lifelink", () => {
    const { game, a } = table();
    const pledgemage = spawn(game, "Silverquill Pledgemage");
    lands(game, "Island", 1);
    pickModes(a, 1);
    cast(game, toHand(game, "Opt"));
    expect(keywords(game, pledgemage).has("lifelink")).toBe(true);
    expect(keywords(game, pledgemage).has("flying")).toBe(false);
  });

  it("Mage Hunter: an opponent casting an instant loses 1 life", () => {
    const { game } = table();
    spawn(game, "Mage Hunter");
    nextTurn(game);
    lands(game, "Island", 1, B);
    cast(game, toHand(game, "Opt", B), { player: B });
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});
