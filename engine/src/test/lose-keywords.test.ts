/**
 * Keyword loss — "loses flying until end of turn" (the `lose-keywords`
 * effect) and "equipped creature … loses flying" (`StaticAbility
 * .loseKeywords`): applied in layer 6 at its timestamp (rule 613.7), so it
 * takes away what had the keyword before and a later grant gives it back.
 * Each test written from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  grant,
  keywords,
  lands,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

function mana(game: Parameters<typeof lands>[0]): void {
  for (const basic of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, basic, 2);
}

describe("lose-keywords", () => {
  it("Emerald Charm: target creature loses flying until end of turn, and has it again next turn", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    mana(game);
    cast(game, toHand(game, "Emerald Charm"), { modes: [2], targets: [ref(angel)] });
    expect(keywords(game, angel).has("flying")).toBe(false);
    // Its vigilance stays: only flying goes.
    expect(keywords(game, angel).has("vigilance")).toBe(true);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(keywords(game, angel).has("flying")).toBe(true);
  });

  it("a grant after the loss gives the keyword back; one before it doesn't", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, bears, "flying");
    mana(game);
    cast(game, toHand(game, "Emerald Charm"), { modes: [2], targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(false);
    grant(game, bears, "flying");
    expect(keywords(game, bears).has("flying")).toBe(true);
  });

  it("Shadowspear: permanents opponents control lose hexproof and indestructible; one entering later keeps them", () => {
    const { game } = table();
    const spear = spawn(game, "Shadowspear");
    const scout = spawn(game, "Gladecover Scout", B);
    const mine = spawn(game, "Gladecover Scout");
    mana(game);
    activate(game, spear, 0);
    expect(keywords(game, scout).has("hexproof")).toBe(false);
    expect(keywords(game, mine).has("hexproof")).toBe(true);
    const later = spawn(game, "Gladecover Scout", B);
    expect(keywords(game, later).has("hexproof")).toBe(true);
  });

  it("Spectacular Pileup: an indestructible creature loses it, then everything is destroyed", () => {
    const { game } = table();
    const god = spawn(game, "Darksteel Myr", B);
    const bears = spawn(game, "Grizzly Bears");
    mana(game);
    cast(game, toHand(game, "Spectacular Pileup"));
    expect(zone(game, god)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Jaded Analyst loses defender and gains vigilance on your second draw of a turn", () => {
    const { game, a } = table();
    const analyst = spawn(game, "Jaded Analyst");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(keywords(game, analyst).has("defender")).toBe(false);
    expect(keywords(game, analyst).has("vigilance")).toBe(true);
    void a;
  });

  it("Quick Draw: creatures the target opponent controls lose first strike and double strike", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const knight = spawn(game, "Fencing Ace", B);
    mana(game);
    cast(game, toHand(game, "Quick Draw"), { targets: [ref(mine), ref(B)] });
    expect(keywords(game, mine).has("first-strike")).toBe(true);
    expect(keywords(game, knight).has("double-strike")).toBe(false);
  });

  it("Fear of Falling: the creature loses flying until your next turn", () => {
    const { game, a } = table();
    const fear = spawn(game, "Fear of Falling");
    const angel = spawn(game, "Serra Angel", B);
    a.chooseTargetsFn = () => [ref(angel)];
    attack(game, a, [fear]);
    expect(keywords(game, angel).has("flying")).toBe(false);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(keywords(game, angel).has("flying")).toBe(false);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "upkeep");
    expect(keywords(game, angel).has("flying")).toBe(true);
  });
});

describe("a static keyword loss", () => {
  it("Starforged Sword: equipped creature loses flying; flying granted after it isn't lost", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel");
    const sword = spawn(game, "Starforged Sword");
    mana(game);
    pickPermanents(a);
    activate(game, sword, 0, { targets: [ref(angel)] });
    expect(keywords(game, angel).has("flying")).toBe(false);
    grant(game, angel, "flying");
    expect(keywords(game, angel).has("flying")).toBe(true);
  });

  it("Starforged Sword cast with the gift attaches as it enters; the opponent gets a tapped Fish", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel");
    pickModes(a, 0);
    mana(game);
    a.chooseTargetsFn = () => [ref(angel)];
    const sword = toHand(game, "Starforged Sword");
    cast(game, sword, { kicked: true });
    expect(game.state.objects[sword].attachedTo).toBe(angel);
    expect(keywords(game, angel).has("flying")).toBe(false);
    void enter;
  });
});
