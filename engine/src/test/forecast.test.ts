import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  keywords,
  lands,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

// Forecast (rule 702.57): an ability of the card in its owner's hand,
// activatable only during their upkeep and only once each turn, the card
// revealed and kept in the hand (the `forecast()` helper).

describe("Forecast", () => {
  it("works from the hand in your upkeep, once each turn, and again next turn", () => {
    const { game } = table();
    const scribing = toHand(game, "Skyscribing");
    lands(game, "Island", 3);
    toStep(game, "upkeep");
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    activate(game, scribing, 0);
    expect(zone(game, scribing)).toBe("hand");
    expect(hand(game, A).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirs + 1);
    // Once each turn (702.57b) — the land is untapped, the mana is there.
    lands(game, "Island", 3);
    expect(() => activate(game, scribing, 0)).toThrow(/already been activated/);
    // The next upkeep of yours, it can be activated again: the record of
    // a card that stayed in the hand is cleared as each turn begins.
    toStep(game, "upkeep");
    const before = hand(game, A).length;
    activate(game, scribing, 0);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("can't be activated outside your upkeep", () => {
    const { game } = table();
    const scribing = toHand(game, "Skyscribing");
    lands(game, "Island", 3);
    // Your main phase.
    expect(() => activate(game, scribing, 0)).toThrow(/condition/);
    // An opponent's upkeep.
    toStep(game, "upkeep", B);
    expect(() => activate(game, scribing, 0, { player: A })).toThrow();
  });

  it("is still the card's own spell from the hand afterwards (Steeling Stance)", () => {
    const { game } = table();
    const stance = toHand(game, "Steeling Stance");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    toStep(game, "upkeep");
    activate(game, stance, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    toStep(game, "precombat-main");
    cast(game, stance);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, stance)).toBe("graveyard");
  });

  it("Sky Hussar taps two white and/or blue creatures, summoning-sick ones too", () => {
    const { game } = table();
    const hussar = toHand(game, "Sky Hussar");
    toStep(game, "upkeep");
    const red = spawn(game, "Raging Goblin");
    const white = spawn(game, "Savannah Lions", A, { sick: true });
    // One white creature and a red one don't pay it.
    expect(() => activate(game, hussar, 0)).toThrow();
    const blue = spawn(game, "Coral Merfolk", A, { sick: true });
    const before = hand(game, A).length;
    activate(game, hussar, 0);
    expect(hand(game, A).length).toBe(before + 1);
    expect(game.state.objects[white].tapped).toBe(true);
    expect(game.state.objects[blue].tapped).toBe(true);
    expect(game.state.objects[red].tapped).toBe(false);
  });

  it("Pride of the Clouds makes a white-blue Bird and counts the other fliers", () => {
    const { game } = table();
    const pride = toHand(game, "Pride of the Clouds");
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    toStep(game, "upkeep");
    activate(game, pride, 0);
    expect(tokensNamed(game, "Bird Token (White-Blue)", A)).toBe(1);
    const onBoard = spawn(game, "Pride of the Clouds");
    expect(pt(game, onBoard)).toEqual({ power: 2, toughness: 2 });
  });

  it("Proclamation of Rebirth returns up to three one-drops, or one by forecast", () => {
    const { game } = table();
    const proclamation = toHand(game, "Proclamation of Rebirth");
    const lions = toGraveyard(game, "Savannah Lions");
    const goblin = toGraveyard(game, "Raging Goblin");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 6);
    toStep(game, "upkeep");
    activate(game, proclamation, 0, { targets: [ref(lions)] });
    expect(zone(game, lions)).toBe("battlefield");
    expect(() => activate(game, proclamation, 0, { targets: [ref(bears)] })).toThrow();
    toStep(game, "precombat-main");
    const elf = toGraveyard(game, "Llanowar Elves");
    lands(game, "Plains", 3);
    cast(game, proclamation, { targets: [ref(goblin), ref(elf), null] });
    expect(zone(game, goblin)).toBe("battlefield");
    expect(zone(game, elf)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Writ of Passage", () => {
  it("makes its creature unblockable as it attacks only while its power is 2 or less", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    const writ = toHand(game, "Writ of Passage");
    cast(game, writ, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });

  it("does nothing for a creature with power 3 or more", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Island", 1);
    const writ = toHand(game, "Writ of Passage");
    cast(game, writ, { targets: [ref(giant)] });
    attack(game, a, [giant]);
    expect(keywords(game, giant).has("unblockable")).toBe(false);
  });
});
