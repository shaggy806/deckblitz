/**
 * Doctor Who (WHO), batch 1, group b (2026-10-17): Daleks, Cybermen and
 * villainous choices. Written on the shared table in `harness.ts`, from the
 * Oracle text.
 */
import { describe, expect, it } from "vitest";

import { goadersOf } from "../goad.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  grant,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

describe("Dalek Drone", () => {
  it("destroys target creature an opponent controls, and that player loses 3 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Dalek Drone");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

/** A real Dalek token for `player` (`spawn` makes a nontoken card of that name). */
function dalekToken(game: Game, player: PlayerId): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: "Dalek Token", count: 1 });
  const id = named(game, "Dalek Token", player).at(-1);
  if (id === undefined) throw new Error("no Dalek token made");
  return id;
}

describe("Crisis of Conscience", () => {
  it("destroys all tokens", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    dalekToken(game, A);
    dalekToken(game, B);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = spawn(game, "Dalek Token", B); // a card, not a token
    cast(game, toHand(game, "Crisis of Conscience"), { modes: [0] });
    expect(tokensNamed(game, "Dalek Token")).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, card)).toBe("battlefield");
  });

  it("or destroys all nonland, nontoken permanents — lands and tokens stay", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 6);
    dalekToken(game, B);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring");
    cast(game, toHand(game, "Crisis of Conscience"), { modes: [1] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Dalek Token", B)).toBe(1);
    for (const land of plains) expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Flatline", () => {
  it("sets opponents' creatures to base 0/1 until end of turn, counters still applying", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const theirs = spawn(game, "Hill Giant", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Flatline"));
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    // Only the creatures they controlled as it resolved (the ruling).
    const later = spawn(game, "Grizzly Bears", B);
    expect(pt(game, later)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "upkeep", B);
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("The Dalek Emperor", () => {
  it("costs {1} less for each Dalek you control, and gives other Daleks haste", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    dalekToken(game, A);
    const drone = spawn(game, "Dalek Drone", A, { sick: true });
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const emperor = toHand(game, "The Dalek Emperor");
    cast(game, emperor);
    expect(zone(game, emperor)).toBe("battlefield");
    expect(keywords(game, drone).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
    expect(keywords(game, emperor).has("haste")).toBe(false);
  });

  it("at the beginning of combat, the opponent sacrifices a creature of their choice", () => {
    const { game, b } = table();
    spawn(game, "The Dalek Emperor");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    b.chooseModesFn = () => [0];
    b.chooseSacrificesFn = () => [giant];
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Dalek Token", A)).toBe(0);
  });

  it("or you create a 3/3 black Dalek artifact token with menace", () => {
    const { game, b } = table();
    spawn(game, "The Dalek Emperor");
    const bears = spawn(game, "Grizzly Bears", B);
    b.chooseModesFn = () => [1];
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    const [token] = named(game, "Dalek Token", A);
    expect(token).toBeDefined();
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, token).has("menace")).toBe(true);
    // A Dalek, so the Emperor gives it haste.
    expect(keywords(game, token).has("haste")).toBe(true);
  });
});

describe("Sycorax Commander", () => {
  it("the opponent discards their hand, then draws that many minus one", () => {
    const { game, b } = table();
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    const cards = hand(game, B).length;
    const yard = graveyard(game, B).length;
    b.chooseModesFn = () => [0];
    enter(game, "Sycorax Commander");
    expect(graveyard(game, B).length).toBe(yard + cards);
    expect(hand(game, B)).toHaveLength(cards - 1);
    expect(life(game, B)).toBe(20);
  });

  it("or is dealt damage equal to the cards in their hand", () => {
    const { game, b } = table();
    toHand(game, "Grizzly Bears", B);
    const cards = hand(game, B).length;
    b.chooseModesFn = () => [1];
    enter(game, "Sycorax Commander");
    expect(life(game, B)).toBe(20 - cards);
    expect(hand(game, B)).toHaveLength(cards);
  });
});

describe("Ashad, the Lone Cyberman", () => {
  it("gives the first nonlegendary artifact spell each turn casualty 2, and grows when you sacrifice", () => {
    const { game, a } = table();
    const ashad = spawn(game, "Ashad, the Lone Cyberman");
    const bears = spawn(game, "Grizzly Bears");
    let asked = 0;
    a.choosePermanentsFn = () => {
      asked += 1;
      return [bears];
    };
    // A legendary artifact neither has it nor uses it up.
    cast(game, toHand(game, "Mox Amber"));
    expect(asked).toBe(0);
    cast(game, toHand(game, "Memnite"));
    expect(asked).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
    // The copy of an artifact spell becomes a token.
    expect(named(game, "Memnite", A)).toHaveLength(2);
    expect(tokensNamed(game, "Memnite", A)).toBe(1);
    expect(counters(game, ashad)).toBe(1);
    // The second nonlegendary artifact spell this turn doesn't have it.
    cast(game, toHand(game, "Memnite"));
    expect(asked).toBe(1);
  });
});

describe("The Master, Mesmerist", () => {
  it("targets only an opponent's creature with power at most The Master's, which gains skulk and is goaded", () => {
    const { game } = table();
    const master = spawn(game, "The Master, Mesmerist");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Grizzly Bears");
    const refusal = (id: ObjectId): string | null =>
      game.canDispatch({ type: "activate-ability", player: A, source: master, abilityIndex: 0, targets: [ref(id)] });
    expect(refusal(giant)).toBeNull();
    expect(refusal(angel)).not.toBeNull();
    expect(refusal(mine)).not.toBeNull();
    activate(game, master, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("skulk")).toBe(true);
    expect(goadersOf(game.state, registryOf(game), bears)).toContain(A);
  });

  it("grows and draws when a creature with skulk deals combat damage to an opponent", () => {
    const { game, a } = table();
    const master = spawn(game, "The Master, Mesmerist");
    const sneak = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    grant(game, sneak, "skulk");
    const cards = hand(game, A).length;
    attack(game, a, [sneak, plain]);
    expect(life(game, B)).toBe(16);
    expect(counters(game, master)).toBe(1);
    expect(hand(game, A)).toHaveLength(cards + 1);
  });
});
