/**
 * Onslaught, batch B230 group B: Animal Magnetism's opponent-chosen card,
 * the tribal counts and triggers, the Couriers' tapped-duration grants and
 * Spitfire Handler's power-relative block restriction.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Animal Magnetism", () => {
  it("lets the opponent choose which revealed creature card enters; the rest go to the graveyard", () => {
    const { game, a, b } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    lands(game, "Forest", 5);
    let askedA = 0;
    a.chooseFromZoneFn = () => {
      askedA += 1;
      return [];
    };
    const seen = pickFromZone(b, bears);
    const before = graveyard(game, A).length;
    cast(game, toHand(game, "Animal Magnetism"));
    expect(askedA).toBe(0);
    expect(seen.offered).toEqual(expect.arrayContaining([bears, giant]));
    expect(seen.offered).toHaveLength(2);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, giant)).toBe("graveyard");
    // Hill Giant, three Wastes and the sorcery itself.
    expect(graveyard(game, A).length - before).toBe(5);
  });
});

describe("Cabal Slaver", () => {
  it("makes the player a Goblin dealt combat damage to discard a card", () => {
    const { game, a } = table();
    spawn(game, "Cabal Slaver");
    const goblin = spawn(game, "Spitfire Handler");
    const before = hand(game, B).length;
    attack(game, a, [goblin]);
    expect(life(game, B)).toBe(19);
    expect(hand(game, B).length).toBe(before - 1);
  });

  it("ignores a non-Goblin", () => {
    const { game, a } = table();
    spawn(game, "Cabal Slaver");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, B).length;
    attack(game, a, [bears]);
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Nameless One", () => {
  it("counts every Wizard on the battlefield, whoever controls it", () => {
    const { game } = table();
    const one = spawn(game, "Nameless One");
    expect(pt(game, one)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Riptide Chronologist", B);
    spawn(game, "Ghosthelm Courier");
    expect(pt(game, one)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Leery Fogbeast", () => {
  it("prevents all combat damage once it becomes blocked", () => {
    const { game, a } = table();
    const beast = spawn(game, "Leery Fogbeast");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [beast, bears]);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker, attacker: beast }] });
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
    expect(zone(game, beast)).toBe("battlefield");
    expect(zone(game, blocker)).toBe("battlefield");
  });
});

describe("Riptide Chronologist", () => {
  it("untaps every creature of the chosen type, anyone's", () => {
    const { game, a } = table();
    const chrono = spawn(game, "Riptide Chronologist");
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    a.chooseCreatureTypeFn = () => "Bear";
    lands(game, "Island", 1);
    activate(game, chrono);
    expect(zone(game, chrono)).toBe("graveyard");
    expect(game.state.objects[mine].tapped).toBe(false);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("Ghosthelm Courier", () => {
  it("gives a Wizard +2/+2 and shroud only while it stays tapped", () => {
    const { game, a } = table();
    const courier = spawn(game, "Ghosthelm Courier");
    const wizard = spawn(game, "Riptide Chronologist");
    lands(game, "Island", 3);
    pickTargets(a, wizard);
    activate(game, courier, 0, { targets: [ref(wizard)] });
    expect(pt(game, wizard)).toEqual({ power: 3, toughness: 5 });
    expect(keywords(game, wizard).has("shroud")).toBe(true);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(courier)]);
    settle(game);
    expect(pt(game, wizard)).toEqual({ power: 1, toughness: 3 });
    expect(keywords(game, wizard).has("shroud")).toBe(false);
  });
});

describe("Spitfire Handler", () => {
  it("can't block a creature with greater power", () => {
    const { game, a } = table();
    const handler = spawn(game, "Spitfire Handler", B);
    // Another blocker, so bob is asked at all.
    spawn(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears");
    blockOffer(game, a, [bears]);
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: handler, attacker: bears }] })).not.toBeNull();
  });

  it("can block one with equal power", () => {
    const { game, a } = table();
    const handler = spawn(game, "Spitfire Handler", B);
    const elf = spawn(game, "Spitfire Handler");
    blockOffer(game, a, [elf]);
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: handler, attacker: elf }] })).toBeNull();
  });
});

describe("Gangrenous Goliath", () => {
  it("returns from the graveyard to hand by tapping three Clerics", () => {
    const { game } = table();
    const goliath = toGraveyard(game, "Gangrenous Goliath");
    const clerics = [spawn(game, "Cabal Slaver"), spawn(game, "Cabal Slaver"), spawn(game, "Cabal Slaver")];
    activate(game, goliath);
    expect(zone(game, goliath)).toBe("hand");
    expect(clerics.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Fleeting Aven", () => {
  it("returns to its owner's hand when anyone cycles", () => {
    const { game } = table();
    const aven = spawn(game, "Fleeting Aven");
    lands(game, "Wastes", 1);
    const card = toHand(game, "Startling Development", A);
    game.dispatch({ type: "cycle", player: A, card });
    settle(game);
    expect(zone(game, aven)).toBe("hand");
  });
});
