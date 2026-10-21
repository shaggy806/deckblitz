import { describe, expect, it } from "vitest";

import { playerHasHexproof } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

// Ravnica Allegiance, batch 1 group A.

describe("RNA batch 1A", () => {
  it("Gutterbones returns from the graveyard only on your turn after an opponent lost life", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bones = toGraveyard(game, "Gutterbones");
    expect(() => activate(game, bones)).toThrow();
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" });
    activate(game, bones);
    expect(zone(game, bones)).toBe("hand");
  });

  it("Gate Colossus goes from the graveyard to the top of the library when a Gate enters", () => {
    const { game, a } = table();
    const colossus = toGraveyard(game, "Gate Colossus");
    pickModes(a, 0);
    enter(game, "Azorius Guildgate");
    expect(zone(game, colossus)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(colossus);
  });

  it("Titanic Brawl costs {1} less when its creature of yours has a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const brawl = toHand(game, "Titanic Brawl");
    expect(() => cast(game, brawl, { targets: [ref(mine), ref(theirs)] })).toThrow();
    game.state.objects[mine].counters["+1/+1"] = 1;
    cast(game, brawl, { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Gruul Spellbreaker gives you and itself hexproof during your turn only", () => {
    const { game } = table();
    const ogre = spawn(game, "Gruul Spellbreaker");
    expect(playerHasHexproof(game.state, game.registry, A)).toBe(true);
    expect(keywords(game, ogre).has("hexproof")).toBe(true);
    nextTurn(game);
    expect(playerHasHexproof(game.state, game.registry, A)).toBe(false);
    expect(keywords(game, ogre).has("hexproof")).toBe(false);
  });

  it("Mesmerizing Benthid makes two Illusions and has hexproof while you control one", () => {
    const { game } = table();
    const benthid = enter(game, "Mesmerizing Benthid");
    expect(tokensNamed(game, "Illusion Token (Freezing Blocker)", A)).toBe(2);
    expect(keywords(game, benthid).has("hexproof")).toBe(true);
  });

  it("Sharktocrab's adapt taps an opponent's creature, which then doesn't untap", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const crab = spawn(game, "Sharktocrab");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    activate(game, crab);
    expect(counters(game, crab)).toBe(1);
    expect(game.state.objects[theirs].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("Pteramander's adapt costs {1} less per instant and sorcery card in your graveyard", () => {
    const { game } = table();
    lands(game, "Island", 4);
    for (let i = 0; i < 4; i++) toGraveyard(game, "Shock");
    const drake = spawn(game, "Pteramander");
    activate(game, drake);
    expect(counters(game, drake)).toBe(4);
  });

  it("Rix Maadi Reveler cast for spectacle discards the hand and draws three", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" });
    const reveler = toHand(game, "Rix Maadi Reveler");
    const before = graveyard(game).length;
    const handBefore = hand(game).length;
    cast(game, reveler, { altCost: true });
    expect(hand(game).length).toBe(3);
    expect(graveyard(game).length).toBe(before + handBefore - 1);
  });

  it("Rix Maadi Reveler cast normally discards one and draws one", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const reveler = toHand(game, "Rix Maadi Reveler");
    const handBefore = hand(game).length;
    cast(game, reveler);
    expect(hand(game).length).toBe(handBefore - 1);
    expect(graveyard(game).length).toBe(1);
  });

  it("Rakdos Firewheeler hits an opponent and up to one creature", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B, theirs);
    enter(game, "Rakdos Firewheeler");
    expect(life(game, B)).toBe(18);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Clear the Stage returns the creature card only if you control a creature with power 4 or greater", () => {
    const { game, a } = table();
    lands(game, "Swamp", 10);
    const theirs = spawn(game, "Grizzly Bears", B);
    const dead = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    cast(game, toHand(game, "Clear the Stage"), { targets: [ref(theirs), ref(dead)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, dead)).toBe("graveyard");
    spawn(game, "Sharktocrab");
    const second = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Clear the Stage"), { targets: [ref(second), ref(dead)] });
    expect(zone(game, dead)).toBe("hand");
  });

  it("Hero of Precinct One makes a Human for a multicolored spell, not a mono-colored one", () => {
    const { game } = table();
    spawn(game, "Hero of Precinct One");
    lands(game, "Forest", 3);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Pteramander"));
    expect(tokensNamed(game, "Human Token", A)).toBe(0);
    cast(game, toHand(game, "Sharktocrab"));
    expect(tokensNamed(game, "Human Token", A)).toBe(1);
  });

  it("Archway Angel gains 2 life per Gate you control", () => {
    const { game } = table();
    spawn(game, "Azorius Guildgate");
    spawn(game, "Boros Guildgate");
    spawn(game, "Dimir Guildgate", B);
    enter(game, "Archway Angel");
    expect(life(game, A)).toBe(24);
  });

  it("Dagger Caster pings each opponent and each creature they control", () => {
    const { game } = table();
    const mine = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Llanowar Elves", B);
    enter(game, "Dagger Caster");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});
