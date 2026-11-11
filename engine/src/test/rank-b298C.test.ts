/**
 * Batch B298, group C: blocked cards re-attempted by rank. One test per card
 * on the clause its old triage record said couldn't be written.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  loyalty,
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
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

describe("B298 group C", () => {
  it("Chakra Meditation: draw, then discard unless three Lessons are in your graveyard", () => {
    const { game, a } = table();
    spawn(game, "Chakra Meditation");
    lands(game, "Mountain", 2);
    pickTargets(a, B);
    const before = hand(game).length;
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    // +1 Shock to hand, -1 cast, +1 draw, -1 discard.
    expect(hand(game).length).toBe(before);

    for (let i = 0; i < 3; i++) toGraveyard(game, "Aang's Journey");
    const before2 = hand(game).length;
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(hand(game).length).toBe(before2 + 1);
  });

  it("Ori, Plate Stacker: destroys only opponents' artifacts and enchantments, a life each", () => {
    const { game } = table();
    const mine = spawn(game, "Sol Ring");
    const ring = spawn(game, "Sol Ring", B);
    const anthem = spawn(game, "Glorious Anthem", B);
    enter(game, "Ori, Plate Stacker");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, anthem)).toBe("graveyard");
    expect(life(game)).toBe(22);
  });

  it("Mowu: one more +1/+1 counter on Mowu only", () => {
    const { game } = table();
    const mowu = spawn(game, "Mowu, Loyal Companion");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(mowu)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    expect(counters(game, mowu)).toBe(2);
    expect(counters(game, bears)).toBe(1);
  });

  it("Kenessos: a scry 1 looks at two cards", () => {
    const { game, a } = table();
    spawn(game, "Kenessos, Priest of Thassa");
    let seen = 0;
    a.chooseScryFn = (_view, cards) => {
      seen = cards.length;
      return [];
    };
    game.debugApplyEffect(A, { kind: "scry", amount: 1 });
    settle(game);
    expect(seen).toBe(2);
  });

  it("Smaug: noncombat damage makes that many Treasures", () => {
    const { game } = table();
    const smaug = spawn(game, "Smaug the Impenetrable");
    const shocker = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(smaug)], { source: shocker });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });

  it("Sensational Spider-Man: stuns, then draws for each stun counter removed", () => {
    const { game, a } = table();
    const spidey = spawn(game, "Sensational Spider-Man");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "stun", amount: 2 }, [ref(giant)]);
    pickTargets(a, bears);
    a.chooseCounterRemovalsFn = () => [{ object: giant, kind: "stun", count: 2 }];
    const before = hand(game).length;
    attack(game, a, [spidey]);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
    expect(counters(game, giant, "stun")).toBe(0);
    expect(hand(game).length).toBe(before + 2);
  });

  it("Shellshock: X to one creature of each opponent, a Mutagen for each dealt damage", () => {
    const { game, a } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    lands(game, "Mountain", 3);
    pickTargets(a, bobs, carols, null);
    cast(game, toHand(game, "Shellshock"), { x: 2, targets: [ref(bobs), ref(carols), null] });
    expect(zone(game, bobs)).toBe("graveyard");
    expect(game.state.objects[carols].damageMarked).toBe(2);
    expect(tokensNamed(game, "Mutagen Token", A)).toBe(2);
  });

  it("Battle at the Helvault: each player's permanent exiled until the Saga leaves", () => {
    const { game, a } = table();
    const mine = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Hill Giant", B);
    pickTargets(a, mine, theirs);
    const saga = enter(game, "Battle at the Helvault");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, saga);
    expect(named(game, "Sol Ring", A).length).toBe(1);
    expect(named(game, "Hill Giant", B).length).toBe(1);
  });

  it("Don't Make a Sound: paid, the spell resolves and you surveil 2; not paid, it's countered", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(bears)], settle: false });
    let surveilled = 0;
    a.chooseScryFn = (_view, cards, mode) => {
      if (mode === "surveil") surveilled = cards.length;
      return [];
    };
    pickModes(a, 0);
    cast(game, toHand(game, "Don't Make a Sound"), { targets: [ref(shock)] });
    expect(surveilled).toBe(2);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Tax Collector: Tax makes opponents' spells cost {1} more until your next turn", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    enter(game, "Tax Collector");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    b.chooseTargetsFn = () => [ref(A)];
    expect(() => cast(game, shock, { player: B, targets: [ref(A)] })).toThrow();
    lands(game, "Mountain", 1, B);
    cast(game, shock, { player: B, targets: [ref(A)] });
    expect(life(game)).toBe(18);
  });

  it("Huskburster Swarm: {1} less per creature card you own in exile and in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toExile(game, "Grizzly Bears");
    toExile(game, "Hill Giant");
    toExile(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    const swarm = toHand(game, "Huskburster Swarm");
    cast(game, swarm);
    expect(zone(game, swarm)).toBe("battlefield");
  });

  it("Fork: the copy is red", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const unsummon = toHand(game, "Unsummon");
    cast(game, unsummon, { targets: [ref(bears)], settle: false });
    const fork = toHand(game, "Fork");
    cast(game, fork, { targets: [ref(unsummon)], settle: false });
    game.advanceUntil((s) => !s.zones.shared.stack.includes(fork));
    const copy = game.state.zones.shared.stack.find((id) => id !== unsummon) as ObjectId;
    expect(copy).toBeDefined();
    const colors = computeCharacteristics(game.state, game.registry, copy).colors;
    expect([...colors]).toEqual(["R"]);
  });

  it("Confusion in the Ranks: the entering permanent's controller chooses, and they exchange", () => {
    const { game, b } = table();
    spawn(game, "Confusion in the Ranks");
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(b, mine);
    const giant = enter(game, "Hill Giant", B);
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, mine)).toBe(B);
  });

  it("Marchesa: draws at upkeep unless you were dealt combat damage since your last turn", () => {
    const { game, b } = table();
    const invasion = spawn(game, "Invasion of Fiora");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(invasion)]);
    const before = hand(game).length;
    toStep(game, "precombat-main");
    // Alice's own draw step and Marchesa's draw.
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(19);

    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(life(game)).toBe(17);
    const before2 = hand(game).length;
    toStep(game, "precombat-main");
    expect(hand(game).length).toBe(before2 + 1);
    expect(life(game)).toBe(17);
  });

  it("Unidentified Hovership: the exiled card's owner manifests dread as it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const ship = enter(game, "Unidentified Hovership");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, ship);
    const faceDown = game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined && game.state.objects[id].faceDown !== null);
    expect(faceDown.length).toBe(1);
    expect(controller(game, faceDown[0])).toBe(B);
  });

  it("Command the Dreadhorde: damage equal to the targets' total mana value, then they're yours", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant");
    a.chooseTargetsFn = () => [];
    cast(game, toHand(game, "Command the Dreadhorde"), { targets: [ref(bears), ref(giant)] });
    expect(life(game)).toBe(14);
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
    expect(named(game, "Hill Giant", A).length).toBe(1);
  });

  it("Polluted Cistern: each opponent loses a life per card type among the milled cards", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const room = toHand(game, "Polluted Cistern // Dim Oubliette");
    game.dispatch({ type: "cast-spell", player: A, card: room, face: 1, targets: [] });
    settle(game);
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Sol Ring");
    toLibrary(game, "Wastes");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 3 });
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("Ugin's Nexus: exiled instead of dying, and you take an extra turn", () => {
    const { game } = table();
    const nexus = spawn(game, "Ugin's Nexus");
    destroy(game, nexus);
    expect(zone(game, nexus)).toBe("exile");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
  });

  it("Asinine Antics: a Cursed Role on each creature your opponents control", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Asinine Antics"));
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(tokensNamed(game, "Cursed Role Token", A)).toBe(2);
  });

  it("Heartless Conscription: exiled creatures may be cast with mana of any type", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const conscription = toHand(game, "Heartless Conscription");
    cast(game, conscription);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, conscription)).toBe("exile");
    nextTurn(game);
    toStep(game, "precombat-main");
    lands(game, "Island", 2);
    cast(game, bears, { via: "impulse" });
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
  });

  it("Hidetsugu and Kairi: target opponent loses life equal to the exiled card's mana value", () => {
    const { game, a } = table();
    const hk = spawn(game, "Hidetsugu and Kairi");
    const top = toLibrary(game, "Hill Giant");
    pickTargets(a, B);
    destroy(game, hk);
    expect(zone(game, top)).toBe("exile");
    expect(life(game, B)).toBe(16);
  });

  it("Confounding Conundrum: an opponent's second land this turn makes them return a land", () => {
    const { game } = table();
    spawn(game, "Confounding Conundrum");
    enter(game, "Wastes", B);
    expect(named(game, "Wastes", B).length).toBe(1);
    enter(game, "Wastes", B);
    expect(named(game, "Wastes", B).length).toBe(1);
  });

  it("Azor's Gateway: transforms once five different mana values are exiled with it", () => {
    const { game, a } = table();
    const gate = spawn(game, "Azor's Gateway");
    const picks = ["Wastes", "Shock", "Grizzly Bears", "Hill Giant", "Glorious Anthem"].map((n) => toHand(game, n));
    for (let i = 0; i < picks.length; i++) {
      if (i > 0) toStep(game, "precombat-main");
      lands(game, "Wastes", 1);
      pickFromZone(a, picks[i]);
      const lifeBefore = life(game);
      activate(game, gate);
      expect(zone(game, picks[i])).toBe("exile");
      if (i < 4) expect(life(game)).toBe(lifeBefore);
      else expect(life(game)).toBe(lifeBefore + 5);
    }
    expect(game.state.objects[gate].tapped).toBe(false);
    expect(computeCharacteristics(game.state, game.registry, gate).types).toContain("land");
  });

  it("Liliana's Talent: a creature that damages the enchanted planeswalker is destroyed", () => {
    const { game, a } = table();
    const pw = spawn(game, "Liliana Vess");
    lands(game, "Swamp", 2);
    pickTargets(a, pw);
    cast(game, toHand(game, "Liliana's Talent"), { targets: [ref(pw)] });
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(pw)], { source: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Liliana's Talent: the enchanted planeswalker has the [−8]", () => {
    const { game, a } = table();
    const pw = spawn(game, "Liliana Vess");
    lands(game, "Swamp", 2);
    pickTargets(a, pw);
    cast(game, toHand(game, "Liliana's Talent"), { targets: [ref(pw)] });
    const corpse = toGraveyard(game, "Hill Giant", B);
    const talentIndex = game.registry.get("Liliana Vess").activated.length;
    game.state.objects[pw].counters.loyalty = 8;
    activate(game, pw, talentIndex);
    expect(zone(game, corpse)).toBe("battlefield");
    expect(controller(game, corpse)).toBe(A);
    void loyalty;
  });

  it("Blitzball Stadium: the granted trigger draws a card per kind of counter", () => {
    const { game, a } = table();
    const stadium = spawn(game, "Blitzball Stadium");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 1 }, [ref(bears)]);
    lands(game, "Wastes", 3);
    pickTargets(a, bears);
    activate(game, stadium, 0, { targets: [ref(bears)] });
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before + 2);
    void graveyard;
  });
});
