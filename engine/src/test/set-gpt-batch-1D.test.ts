import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Guildpact batch 1D", () => {
  it("Souls of the Faultless: you gain and the attacking player loses the combat damage it's dealt", () => {
    const { game, a, b } = table();
    const souls = spawn(game, "Souls of the Faultless", A);
    const giant = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    a.declareBlockersFn = () => [{ blocker: souls, attacker: giant }];
    toStep(game, "postcombat-main", B);
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(17);
  });

  it("Earth Surge: a land that's a creature gets +2/+2", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor", B);
    const bears = spawn(game, "Grizzly Bears", A);
    spawn(game, "Earth Surge", A);
    expect(pt(game, arbor)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Abyssal Nocturnus: +2/+2 and fear for each card an opponent discards", () => {
    const { game, a } = table();
    const nocturnus = spawn(game, "Abyssal Nocturnus", A);
    lands(game, "Swamp", 3);
    pickTargets(a, B);
    cast(game, toHand(game, "Mind Rot"), { targets: [ref(B)] });
    expect(pt(game, nocturnus)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, nocturnus).has("fear")).toBe(true);
  });

  it("Tin Street Hooligan: destroys an artifact only if {G} was spent", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 2);
    pickTargets(a, thopter);
    cast(game, toHand(game, "Tin Street Hooligan"));
    expect(zone(game, thopter)).toBe("battlefield");

    const { game: g2, a: a2 } = table();
    const thopter2 = spawn(g2, "Ornithopter", B);
    lands(g2, "Mountain", 1);
    lands(g2, "Forest", 1);
    pickTargets(a2, thopter2);
    cast(g2, toHand(g2, "Tin Street Hooligan"));
    expect(zone(g2, thopter2)).toBe("graveyard");
  });

  it("Gristleback: bloodthirst, then sacrifice for life equal to its power", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const boar = enter(game, "Gristleback", A);
    expect(counters(game, boar)).toBe(1);
    const before = life(game, A);
    activate(game, boar, 0);
    expect(zone(game, boar)).toBe("graveyard");
    expect(life(game, A)).toBe(before + 3);
  });

  it("Bloodscale Prowler: no counter when no opponent was dealt damage", () => {
    const { game } = table();
    const prowler = enter(game, "Bloodscale Prowler", A);
    expect(counters(game, prowler)).toBe(0);
  });

  it("Cryptwailing: exiles two creature cards from your graveyard to make a player discard", () => {
    const { game } = table();
    const crypt = spawn(game, "Cryptwailing", A);
    lands(game, "Wastes", 1);
    const g1 = toGraveyard(game, "Grizzly Bears", A);
    const g2 = toGraveyard(game, "Hill Giant", A);
    toGraveyard(game, "Lightning Bolt", A);
    const theirs = hand(game, B).length;
    activate(game, crypt, 0, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(theirs - 1);
    expect(zone(game, g1)).toBe("exile");
    expect(zone(game, g2)).toBe("exile");
    expect(graveyard(game, A).length).toBe(1);
  });

  it("Smogsteed Rider: each other attacking creature gains fear, not the Rider", () => {
    const { game, a } = table();
    const rider = spawn(game, "Smogsteed Rider", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Hill Giant", A);
    spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [rider, bears]);
    expect(keywords(game, bears).has("fear")).toBe(true);
    expect(keywords(game, rider).has("fear")).toBe(false);
    expect(keywords(game, other).has("fear")).toBe(false);
  });

  it("Sinstriker's Will: the enchanted creature deals its power to an attacking creature", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    pickTargets(a, giant);
    cast(game, toHand(game, "Sinstriker's Will"), { targets: [ref(giant)] });
    toStep(game, "precombat-main", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    activate(game, giant, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Izzet Guildmage: copies an instant you control with mana value 2 or less", () => {
    const { game, a } = table();
    const mage = spawn(game, "Izzet Guildmage", A);
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    const shock = toHand(game, "Shock");
    pickTargets(a, B);
    cast(game, shock, { targets: [ref(B)], settle: false });
    activate(game, mage, 0, { targets: [ref(shock)] });
    settle(game);
    expect(life(game, B)).toBe(16);
  });
});
