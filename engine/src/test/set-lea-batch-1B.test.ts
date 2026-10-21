/**
 * Limited Edition Alpha, group B: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  cast,
  controller,
  destroy,
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
  zone,
} from "./harness.js";

describe("LEA group B — Karma", () => {
  it("deals each upkeep's player damage equal to the Swamps that player controls", () => {
    const { game } = table();
    spawn(game, "Karma");
    lands(game, "Swamp", 1, A);
    lands(game, "Swamp", 2, B);
    nextTurn(game); // bob's turn
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
    nextTurn(game); // alice's turn
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });
});

describe("LEA group B — Cursed Land and Feedback", () => {
  it("hurt the enchanted permanent's controller on their upkeep only", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", B);
    const anthem = spawn(game, "Glorious Anthem", B);
    const cursed = spawn(game, "Cursed Land");
    const feedback = spawn(game, "Feedback");
    game.state.objects[cursed].attachedTo = forest;
    game.state.objects[feedback].attachedTo = anthem;
    nextTurn(game); // bob's turn
    expect(life(game, B)).toBe(18);
    nextTurn(game); // alice's turn: not her land or enchantment
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });
});

describe("LEA group B — Dingus Egg", () => {
  it("deals 2 damage to the controller of a land put into a graveyard", () => {
    const { game } = table();
    spawn(game, "Dingus Egg");
    const [theirs] = lands(game, "Forest", 1, B);
    const [mine] = lands(game, "Forest", 1, A);
    destroy(game, theirs);
    expect(life(game, B)).toBe(18);
    destroy(game, mine);
    expect(life(game, A)).toBe(18);
  });
});

describe("LEA group B — Simulacrum", () => {
  it("gains the damage dealt to you this turn and deals it to your creature", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)], { source });
    settle(game);
    expect(life(game, A)).toBe(17);
    lands(game, "Swamp", 2);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Simulacrum"), { targets: [ref(bear)] });
    expect(life(game, A)).toBe(20);
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("LEA group B — Force of Nature", () => {
  it("deals 8 damage to you on your upkeep unless you pay {G}{G}{G}{G}", () => {
    const { game, a } = table();
    spawn(game, "Force of Nature");
    lands(game, "Forest", 4);
    pickModes(a, 0); // pay
    nextTurn(game);
    nextTurn(game); // alice's upkeep
    expect(life(game, A)).toBe(20);
    pickModes(a); // decline
    nextTurn(game);
    nextTurn(game);
    expect(life(game, A)).toBe(12);
  });
});

describe("LEA group B — power-and-toughness CDAs", () => {
  it("Plague Rats counts every player's Plague Rats", () => {
    const { game } = table();
    const mine = spawn(game, "Plague Rats");
    const theirs = spawn(game, "Plague Rats", B);
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Keldon Warlord counts non-Wall creatures you control, itself included", () => {
    const { game } = table();
    const warlord = spawn(game, "Keldon Warlord");
    spawn(game, "Grizzly Bears");
    spawn(game, "Wall of Stone");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, warlord)).toEqual({ power: 2, toughness: 2 });
  });

  it("Sedge Troll gets +1/+1 while you control a Swamp", () => {
    const { game } = table();
    const troll = spawn(game, "Sedge Troll");
    lands(game, "Swamp", 1, B);
    expect(pt(game, troll)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Swamp", 1, A);
    expect(pt(game, troll)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("LEA group B — Steal Artifact", () => {
  it("takes control of the enchanted artifact", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    const steal = spawn(game, "Steal Artifact");
    game.state.objects[steal].attachedTo = ring;
    nextTurn(game);
    expect(controller(game, ring)).toBe(A);
  });
});
