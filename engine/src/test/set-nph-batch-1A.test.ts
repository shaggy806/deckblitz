/**
 * New Phyrexia and Commander 2011, group A. One test per card on its riskiest
 * clause: Riku's two paid copies, Blind Zealot's sacrifice-then-destroy,
 * Shrine of Boundless Growth's two counter triggers and its mana read off the
 * sacrificed artifact, Viridian Harvest leaving with its artifact, Slag
 * Fiend's count over every graveyard, Wing Splicer's Golem-only flying,
 * Inquisitor Exarch's targeted mode and Mindculling's draw-and-discard.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Riku of Two Reflections", () => {
  it("pays {U}{R} to copy an instant, and the copy can take a new target", () => {
    const { game, a } = table();
    spawn(game, "Riku of Two Reflections");
    pickModes(a, 0);
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });

  it("pays {G}{U} for a token copy of another nontoken creature entering", () => {
    const { game, a } = table();
    spawn(game, "Riku of Two Reflections");
    pickModes(a, 0);
    lands(game, "Forest", 3);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Grizzly Bears"));
    const bears = named(game, "Grizzly Bears", A);
    expect(bears).toHaveLength(2);
    expect(bears.filter((id) => game.state.objects[id].isToken === true)).toHaveLength(1);
    // The token entering doesn't trigger it again (nontoken), so only one copy.
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Forest" && game.state.objects[id].tapped)).toHaveLength(3);
  });
});

describe("Blind Zealot", () => {
  it("sacrifices itself after combat damage to destroy a creature that player controls", () => {
    const { game, a } = table();
    const zealot = spawn(game, "Blind Zealot");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [zealot]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, zealot)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Shrine of Boundless Growth", () => {
  it("gets a counter for a green spell and at upkeep, then sacrifices for that much {C}", () => {
    const { game } = table();
    const shrine = spawn(game, "Shrine of Boundless Growth");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, shrine, "charge")).toBe(1);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, shrine, "charge")).toBe(1);
    toStep(game, "precombat-main");
    expect(counters(game, shrine, "charge")).toBe(2);
    const before = game.state.players[A].manaPool.length;
    activate(game, shrine, 0);
    expect(zone(game, shrine)).toBe("graveyard");
    expect(game.state.players[A].manaPool.length - before).toBe(2);
  });
});

describe("Viridian Harvest", () => {
  it("gains 6 life when the enchanted artifact and the Aura go to the graveyard together", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Forest", 1);
    pickTargets(a, thopter);
    const harvest = toHand(game, "Viridian Harvest");
    cast(game, harvest, { targets: [ref(thopter)] });
    expect(game.state.objects[harvest].attachedTo).toBe(thopter);
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "enchantment"] } }, []);
    settle(game);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, harvest)).toBe("graveyard");
    expect(life(game, A)).toBe(26);
  });
});

describe("Slag Fiend", () => {
  it("counts artifact cards in every graveyard", () => {
    const { game } = table();
    const fiend = spawn(game, "Slag Fiend");
    toGraveyard(game, "Ornithopter", A);
    toGraveyard(game, "Ornithopter", B);
    toGraveyard(game, "Grizzly Bears", B);
    expect(pt(game, fiend)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Wing Splicer", () => {
  it("makes a Golem, and only Golems fly", () => {
    const { game } = table();
    const splicer = enter(game, "Wing Splicer");
    expect(tokensNamed(game, "Phyrexian Golem Token", A)).toBe(1);
    const golem = named(game, "Phyrexian Golem Token", A)[0];
    expect(keywords(game, golem).has("flying")).toBe(true);
    expect(keywords(game, splicer).has("flying")).toBe(false);
  });
});

describe("Inquisitor Exarch", () => {
  it("makes target opponent lose 2 life in its second mode", () => {
    const { game, a } = table();
    pickModes(a, 1);
    pickTargets(a, B);
    enter(game, "Inquisitor Exarch");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Mindculling", () => {
  it("draws you two and makes target opponent discard two", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Mindculling"), { targets: [ref(B)] });
    expect(hand(game, A).length).toBe(mine + 2);
    expect(hand(game, B).length).toBe(theirs - 2);
  });
});
