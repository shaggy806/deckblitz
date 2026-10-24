/**
 * Conspiracy: Take the Crown and Eldritch Moon, group D — the clause of each
 * card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { isGoaded } from "../goad.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  enter,
  graveyard,
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

describe("Besmirch", () => {
  it("steals, untaps, hastes and goads the target until end of turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B, { tapped: true, sick: true });
    pickTargets(a, giant);
    cast(game, toHand(game, "Besmirch"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    expect(isGoaded(game.state, game.registry, giant)).toBe(true);
  });
});

describe("Jeering Homunculus", () => {
  it("may goad the target creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    enter(game, "Jeering Homunculus");
    expect(isGoaded(game.state, game.registry, bears)).toBe(true);
  });

  it("declined, goads nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a);
    enter(game, "Jeering Homunculus");
    expect(isGoaded(game.state, game.registry, bears)).toBe(false);
  });
});

describe("Spectral Grasp", () => {
  it("the enchanted creature can't block the Aura controller's creatures", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Hill Giant", B);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Spectral Grasp"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    const offer = blockOffer(game, a, [giant]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).not.toContain(giant);
    expect(offer.eligible.find((e) => e.blocker === other)?.canBlock ?? []).toContain(giant);
  });
});

describe("Grenzo's Ruffians", () => {
  it("melee, then the combat damage dealt again to each other opponent", () => {
    const { game, a } = table({ players: 3 });
    const ruffians = spawn(game, "Grenzo's Ruffians");
    toStep(game, "precombat-main");
    attack(game, a, [ruffians], B);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Oath of Liliana", () => {
  it("each opponent sacrifices a creature; a Zombie only after a planeswalker entered under your control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Oath of Liliana");
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
    toStep(game, "precombat-main");
    enter(game, "Liliana Vess");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Voldaren Pariah", () => {
  it("sacrificing three other creatures transforms it; the target opponent sacrifices three", () => {
    const { game, a } = table();
    const pariah = spawn(game, "Voldaren Pariah");
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const theirs = [spawn(game, "Hill Giant", B), spawn(game, "Hill Giant", B), spawn(game, "Hill Giant", B), spawn(game, "Grizzly Bears", B)];
    pickTargets(a, B);
    activate(game, pariah);
    for (const id of mine) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, pariah)).toBe("battlefield");
    expect(game.state.objects[pariah].face).toBe(1);
    expect(theirs.filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
  });
});

describe("Bedlam Reveler", () => {
  it("costs {1} less per instant and sorcery card in your graveyard, then wheels three", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Murder");
    toGraveyard(game, "Grizzly Bears");
    const reveler = toHand(game, "Bedlam Reveler");
    const others = hand(game).filter((id) => id !== reveler);
    cast(game, reveler);
    expect(zone(game, reveler)).toBe("battlefield");
    for (const id of others) expect(zone(game, id)).toBe("graveyard");
    expect(hand(game)).toHaveLength(3);
  });
});

describe("Waxing Moon", () => {
  it("transforms the target Werewolf and gives your creatures trample", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const prowler = spawn(game, "Kessig Prowler");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Waxing Moon"), { targets: [ref(prowler)] });
    expect(game.state.objects[prowler].face).toBe(1);
    expect(pt(game, prowler)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });

  it("with no target, still gives trample", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Waxing Moon"), { targets: [null] });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Lunarch Mantle", () => {
  it("+2/+2, and the creature's granted ability can sacrifice the Mantle itself and still fly", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const mantle = toHand(game, "Lunarch Mantle");
    cast(game, mantle, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const action = { type: "activate-ability", player: A, source: bears, abilityIndex: 0, targets: [], sacrifice: mantle } as const;
    expect(game.canDispatch(action)).toBeNull();
    game.dispatch(action);
    settle(game);
    expect(zone(game, mantle)).toBe("graveyard");
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Mournwillow", () => {
  it("with delirium, creatures with power 2 or less can't block this turn", () => {
    const { game, a } = table();
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const willow = enter(game, "Mournwillow");
    const offer = blockOffer(game, a, [willow]);
    expect(game.state.turn.number).toBe(1);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).not.toContain(willow);
    expect(offer.eligible.find((e) => e.blocker === giant)?.canBlock ?? []).toContain(willow);
  });

  it("without delirium, nothing changes", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const willow = enter(game, "Mournwillow");
    const offer = blockOffer(game, a, [willow]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).toContain(willow);
  });
});

describe("Stensia Banquet", () => {
  it("deals damage equal to the Vampires you control, then draws", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Stensia Innkeeper");
    spawn(game, "Stensia Innkeeper");
    pickTargets(a, B);
    const card = toHand(game, "Stensia Banquet");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toContain(card);
  });
});

describe("Stensia Innkeeper", () => {
  it("taps the target land, which skips its controller's next untap", () => {
    const { game, a } = table();
    const land = spawn(game, "Forest", B);
    pickTargets(a, land);
    enter(game, "Stensia Innkeeper");
    expect(game.state.objects[land].tapped).toBe(true);
    toStep(game, "precombat-main", B);
    expect(game.state.objects[land].tapped).toBe(true);
    expect(named(game, "Stensia Innkeeper", A)).toHaveLength(1);
  });
});
