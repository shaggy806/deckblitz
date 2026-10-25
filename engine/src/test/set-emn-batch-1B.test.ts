/**
 * The set walk, Eldritch Moon (EMN), group B: the clause of each card most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
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

type SacrificeOffer = Extract<LegalAction, { kind: "sacrifice" }>;

/** Four card types in alice's graveyard: land, creature, instant, sorcery. */
function delirium(game: Game): void {
  toGraveyard(game, "Wastes");
  toGraveyard(game, "Grizzly Bears");
  toGraveyard(game, "Shock");
  toGraveyard(game, "Divination");
}

describe("Cemetery Recruitment", () => {
  it("draws a card only when the returned card is a Zombie", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const zombie = toGraveyard(game, "Liliana's Elite");
    const bears = toGraveyard(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "Cemetery Recruitment"), { targets: [ref(zombie)] });
    expect(zone(game, zombie)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
    cast(game, toHand(game, "Cemetery Recruitment"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Ulvenwald Observer", () => {
  it("draws for a creature with toughness 4 or greater dying — itself included — and not for a smaller one", () => {
    const { game } = table();
    const observer = spawn(game, "Ulvenwald Observer");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    destroy(game, bears);
    settle(game);
    expect(hand(game).length).toBe(before);
    destroy(game, observer);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Voldaren Pariah // Abolisher of Bloodlines", () => {
  it("sacrifices three other creatures to transform, and the target opponent sacrifices three", () => {
    const { game, a } = table();
    const pariah = spawn(game, "Voldaren Pariah");
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const kept = spawn(game, "Grizzly Bears");
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    pickTargets(a, B);
    activate(game, pariah, 0, { settle: false });
    const offer = game.legalActions(A).find((o): o is SacrificeOffer => o.kind === "sacrifice");
    expect(offer?.count).toBe(3);
    expect(offer?.eligible).not.toContain(pariah);
    game.dispatch({ type: "sacrifice", player: A, permanents: mine });
    settle(game);
    expect(game.state.objects[pariah].face).toBe(1);
    expect(zone(game, kept)).toBe("battlefield");
    expect(theirs.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
  });
});

describe("Lone Rider", () => {
  it("transforms at the end step after its controller gained 3 life", () => {
    const { game } = table();
    const rider = spawn(game, "Lone Rider");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[rider].face).toBe(1);
  });

  it("doesn't with only 2 life gained", () => {
    const { game } = table();
    const rider = spawn(game, "Lone Rider");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[rider].face ?? 0).toBe(0);
  });
});

describe("Bloodhall Priest", () => {
  it("deals 2 damage on entering only with no cards in hand", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Bloodhall Priest");
    expect(life(game, B)).toBe(20);
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    settle(game);
    expect(hand(game).length).toBe(0);
    enter(game, "Bloodhall Priest");
    expect(life(game, B)).toBe(18);
  });
});

describe("Lunar Force", () => {
  it("is sacrificed and counters an opponent's spell", () => {
    const { game } = table();
    const force = spawn(game, "Lunar Force");
    nextTurn(game);
    lands(game, "Island", 3, B);
    const divination = toHand(game, "Divination", B);
    const before = hand(game, B).length;
    cast(game, divination, { player: B });
    expect(zone(game, divination)).toBe("graveyard");
    expect(zone(game, force)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Mournwillow", () => {
  it("with delirium, creatures with power 2 or less can't block this turn", () => {
    const { game, a } = table();
    delirium(game);
    const willow = enter(game, "Mournwillow");
    spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [willow]);
    expect(offer.eligible.map((e) => e.blocker)).toEqual([giant]);
  });

  it("does nothing without delirium", () => {
    const { game, a } = table();
    const willow = enter(game, "Mournwillow");
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [willow]);
    expect(offer.eligible.map((e) => e.blocker)).toEqual([bears]);
  });
});

describe("Lunarch Mantle", () => {
  it("gives +2/+2, and its granted ability can sacrifice the Mantle itself and still grant flying", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const mantle = toHand(game, "Lunarch Mantle");
    cast(game, mantle, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    game.dispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: 0, targets: [], sacrifice: mantle });
    settle(game);
    expect(zone(game, mantle)).toBe("graveyard");
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Haunted Dead", () => {
  it("returns from the graveyard tapped for {1}{B} and two discards, making a Spirit", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const dead = toGraveyard(game, "Haunted Dead");
    const before = hand(game).length;
    activate(game, dead, 0);
    expect(zone(game, dead)).toBe("battlefield");
    expect(game.state.objects[dead].tapped).toBe(true);
    expect(hand(game).length).toBe(before - 2);
    expect(graveyard(game).length).toBe(2);
    expect(Object.values(game.state.objects).filter((o) => o.cardName === "Spirit Token" && o.zone === "battlefield").length).toBe(1);
  });
});

describe("Borrowed Malevolence", () => {
  it("with both modes pays {2} more and does each", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Borrowed Malevolence"), { modes: [0, 1], targets: [ref(mine), ref(theirs)] });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Scour the Laboratory", () => {
  it("costs {2} less with delirium", () => {
    const { game } = table();
    delirium(game);
    lands(game, "Island", 4);
    const before = hand(game).length;
    cast(game, toHand(game, "Scour the Laboratory"));
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Choking Restraints", () => {
  it("is sacrificed to exile the creature it enchanted", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const restraints = toHand(game, "Choking Restraints");
    cast(game, restraints, { targets: [ref(bears)] });
    activate(game, restraints, 0);
    expect(zone(game, restraints)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Geist of the Lonely Vigil", () => {
  it("can attack despite defender only with delirium", () => {
    const { game, a } = table();
    const geist = spawn(game, "Geist of the Lonely Vigil");
    a.declareAttackersFn = () => [{ attacker: geist, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
    delirium(game);
    nextTurn(game);
    nextTurn(game);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(18);
  });
});
