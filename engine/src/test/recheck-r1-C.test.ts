/**
 * Recheck list R1, group C (B235): cards triaged before and left blocked whose records named no
 * open need any more, on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
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
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

/** Run to `player`'s declare-attackers decision and return what they're offered. */
function attackOffer(game: Game, player: PlayerId): AttackOffer {
  game.advanceUntil((s) => (s.awaiting?.kind === "attackers" && s.awaiting.player === player) || s.result.over);
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error(`${player} wasn't asked to attack`);
  return offer;
}

/** Bob's precombat main (his turn), then alice holds priority. */
function aliceOnBobsTurn(game: Game): void {
  nextTurn(game);
  game.dispatch({ type: "pass-priority", player: B });
  expect(game.state.priority.holder).toBe(A);
}

const addCounter = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);

describe("Rite of the Raging Storm", () => {
  it("gives the upkeep's player a Lightning Rager that can't attack the Rite's controller", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Rite of the Raging Storm");
    const offer = attackOffer(game, B);
    const rager = named(game, "Lightning Rager Token", B);
    expect(rager).toHaveLength(1);
    expect(tokensNamed(game, "Lightning Rager Token", A)).toBe(0);
    // Named only Lightning Rager, with haste: it may attack carol, not alice.
    expect(offer.eligible).toContain(rager[0]);
    expect(offer.defendersFor[rager[0]]).toContain(C);
    expect(offer.defendersFor[rager[0]]).not.toContain(A);
  });
});

describe("Droning Bureaucrats", () => {
  it("stops each creature with mana value X, one entering later included", () => {
    const { game } = table();
    const bureaucrats = spawn(game, "Droning Bureaucrats");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    aliceOnBobsTurn(game);
    activate(game, bureaucrats, 0, { x: 2 });
    const later = spawn(game, "Grizzly Bears", B);
    const offer = attackOffer(game, B);
    expect(offer.eligible).toContain(elves);
    expect(offer.eligible).not.toContain(bears);
    expect(offer.eligible).not.toContain(later);
  });
});

describe("Black Sun's Twilight", () => {
  it("with X of 5 and no target, returns a creature card with mana value 5 or less, tapped", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const angel = toGraveyard(game, "Serra Angel");
    const dragon = toGraveyard(game, "Shivan Dragon");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = pickFromZone(a, angel);
    cast(game, toHand(game, "Black Sun's Twilight"), { x: 5, targets: [null] });
    expect(seen.offered).toContain(angel);
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(dragon);
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[angel].tapped).toBe(true);
  });

  it("with X under 5, only shrinks the target", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const angel = toGraveyard(game, "Serra Angel");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Black Sun's Twilight"), { x: 4, targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("Docent of Perfection", () => {
  it("transforms once you control three Wizards; Final Iteration pumps them", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const docent = spawn(game, "Docent of Perfection");
    // A Wizard of another kind: the count is of Wizards, not of its tokens.
    spawn(game, "Merfolk Wizard Token");
    cast(game, toHand(game, "Opt"));
    expect(pt(game, docent)).toEqual({ power: 5, toughness: 4 });
    cast(game, toHand(game, "Opt"));
    // The third Wizard: it transforms, and the spell that caused it doesn't
    // trigger Final Iteration's own ability (the ruling).
    expect(tokensNamed(game, "Human Wizard Token", A)).toBe(2);
    expect(pt(game, docent)).toEqual({ power: 6, toughness: 5 });
    const wizard = named(game, "Human Wizard Token", A)[0];
    expect(pt(game, wizard)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, wizard).has("flying")).toBe(true);
  });
});

describe("Kulrath Knight", () => {
  it("stops opponents' creatures with any kind of counter from attacking", () => {
    const { game } = table();
    spawn(game, "Kulrath Knight");
    const countered = spawn(game, "Grizzly Bears", B);
    const plain = spawn(game, "Grizzly Bears", B);
    addCounter(game, countered);
    nextTurn(game);
    const offer = attackOffer(game, B);
    expect(offer.eligible).toContain(plain);
    expect(offer.eligible).not.toContain(countered);
  });
});

describe("Palani's Hatcher", () => {
  it("makes two Eggs, then hatches one into a 3/3 Dinosaur at the beginning of combat", () => {
    const { game } = table();
    enter(game, "Palani's Hatcher");
    expect(tokensNamed(game, "Dinosaur Egg Token", A)).toBe(2);
    const egg = named(game, "Dinosaur Egg Token", A)[0];
    expect(keywords(game, egg).has("haste")).toBe(true);
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Dinosaur Egg Token", A)).toBe(1);
    expect(tokensNamed(game, "3/3 Dinosaur Token", A)).toBe(1);
  });
});

describe("Moseo, Vein's New Dean", () => {
  it("returns a creature card with mana value up to the life gained this turn", () => {
    const { game, a } = table();
    spawn(game, "Moseo, Vein's New Dean");
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "end");
    settle(game);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("doesn't trigger without life gained", () => {
    const { game, a } = table();
    spawn(game, "Moseo, Vein's New Dean");
    toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a);
    toStep(game, "end");
    settle(game);
    expect(seen.asked).toBe(0);
  });
});

describe("Court of Embereth", () => {
  it("makes a Knight each upkeep, then deals the monarch's creature count to each opponent", () => {
    const { game } = table();
    enter(game, "Court of Embereth");
    expect(game.state.monarch).toBe(A);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    nextTurn(game); // bob's
    nextTurn(game); // alice's: upkeep
    expect(tokensNamed(game, "3/1 Knight Token", A)).toBe(1);
    expect(life(game, B)).toBe(20 - 3);
  });
});

describe("Awaken the Honored Dead", () => {
  it("chapter III: discard a card, then return a creature card from your graveyard to hand", () => {
    const { game, a } = table();
    const victim = spawn(game, "Grizzly Bears", B);
    pickTargets(a, victim);
    const saga = enter(game, "Awaken the Honored Dead");
    expect(zone(game, victim)).toBe("graveyard");
    const before = graveyard(game, A).length;
    nextTurn(game);
    nextTurn(game); // chapter II: mill three
    settle(game);
    expect(graveyard(game, A).length).toBe(before + 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    nextTurn(game);
    nextTurn(game); // chapter III
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, saga)).toBe("graveyard");
    expect(hand(game, A)).toContain(bears);
  });
});

describe("Fungal Rebirth", () => {
  it("returns a permanent card, with two Saprolings only if a creature died this turn", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const first = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Fungal Rebirth"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("hand");
    expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
    destroy(game, spawn(game, "Hill Giant", B));
    const second = toGraveyard(game, "Forest");
    cast(game, toHand(game, "Fungal Rebirth"), { targets: [ref(second)] });
    expect(zone(game, second)).toBe("hand");
    expect(tokensNamed(game, "Saproling Token", A)).toBe(2);
  });
});

describe("Far Wanderings", () => {
  const wastesOnBattlefield = (game: Game): number =>
    named(game, "Wastes", A).filter((id) => game.state.objects[id].tapped).length;

  it("finds one basic land, or up to three with threshold", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Far Wanderings"));
    expect(wastesOnBattlefield(game)).toBe(1);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    cast(game, toHand(game, "Far Wanderings"));
    expect(wastesOnBattlefield(game)).toBe(4);
  });
});

describe("Servo Schematic", () => {
  it("makes a Servo as it enters and as it's put into a graveyard", () => {
    const { game } = table();
    const schematic = enter(game, "Servo Schematic");
    expect(tokensNamed(game, "Servo Token", A)).toBe(1);
    destroy(game, schematic);
    expect(tokensNamed(game, "Servo Token", A)).toBe(2);
  });
});
