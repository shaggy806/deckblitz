/**
 * Ixalan and Commander 2017, group B.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
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
  watchTargets,
  zone,
} from "./harness.js";

describe("Tempest Caller", () => {
  it("taps every creature the target opponent controls, and none of yours", () => {
    const { game, a } = table();
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Vampire Nighthawk", B)];
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    enter(game, "Tempest Caller");
    for (const id of theirs) expect(game.state.objects[id].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("March of the Drowned", () => {
  it("the second mode returns two Pirate cards", () => {
    const { game } = table();
    const one = toGraveyard(game, "Daring Saboteur");
    const two = toGraveyard(game, "Storm Fleet Aerialist");
    lands(game, "Swamp", 1);
    const march = toHand(game, "March of the Drowned");
    cast(game, march, { modes: [1], targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
  });

  it("the second mode can't be cast with only one Pirate card", () => {
    const { game } = table();
    const one = toGraveyard(game, "Daring Saboteur");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    const march = toHand(game, "March of the Drowned");
    expect(() => cast(game, march, { modes: [1], targets: [ref(one), ref(bears)] })).toThrow();
  });
});

describe("Walk the Plank", () => {
  it("can't target a Merfolk", () => {
    const { game } = table();
    const merfolk = spawn(game, "Merfolk Looter", B);
    lands(game, "Swamp", 2);
    const plank = toHand(game, "Walk the Plank");
    expect(() => cast(game, plank, { targets: [ref(merfolk)] })).toThrow();
  });
});

describe("Dire Fleet Captain", () => {
  it("gets +1/+1 for each other attacking Pirate", () => {
    const { game, a } = table();
    const captain = spawn(game, "Dire Fleet Captain");
    const pirates = [spawn(game, "Daring Saboteur"), spawn(game, "Daring Saboteur")];
    attack(game, a, [captain, ...pirates]);
    expect(pt(game, captain)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Huatli, Dinosaur Knight", () => {
  it("−3: the Dinosaur deals damage one way only", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Dinosaur Knight");
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    const nighthawk = spawn(game, "Vampire Nighthawk", B);
    loyalty(game, huatli, -3, { targets: [ref(dreadmaw), ref(nighthawk)] });
    expect(zone(game, nighthawk)).toBe("graveyard");
    expect(zone(game, dreadmaw)).toBe("battlefield");
  });

  it("−7: Dinosaurs you control get +4/+4", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Dinosaur Knight");
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, huatli, -7, { atLeast: 7 });
    expect(pt(game, dreadmaw)).toEqual({ power: 10, toughness: 10 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Pirate's Cutlass", () => {
  it("attaches itself to a Pirate as it enters", () => {
    const { game, a } = table();
    const pirate = spawn(game, "Daring Saboteur");
    pickTargets(a, pirate);
    const cutlass = enter(game, "Pirate's Cutlass");
    expect(game.state.objects[cutlass].attachedTo).toBe(pirate);
    expect(pt(game, pirate)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Dreamcaller Siren", () => {
  it("doesn't trigger without another Pirate", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a);
    enter(game, "Dreamcaller Siren");
    expect(seen.asked).toBe(0);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("taps up to two nonland permanents with another Pirate", () => {
    const { game, a } = table();
    spawn(game, "Daring Saboteur");
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, bears, ring);
    enter(game, "Dreamcaller Siren");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[ring].tapped).toBe(true);
  });
});

describe("Rowdy Crew", () => {
  it("two discarded cards sharing a card type give it two counters", () => {
    const { game } = table();
    const before = hand(game).length;
    for (let i = 0; i < 3; i++) toLibrary(game, "Grizzly Bears");
    const crew = enter(game, "Rowdy Crew");
    expect(hand(game).length).toBe(before + 1);
    // The hand is all Wastes and Bears: any two share a card type.
    expect(counters(game, crew)).toBe(2);
  });

  it("two discarded cards of different card types give none", () => {
    const { game } = table();
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Sol Ring");
    const crew = enter(game, "Rowdy Crew");
    expect(hand(game).length).toBe(1);
    expect(counters(game, crew)).toBe(0);
  });
});

describe("Vineshaper Mystic", () => {
  it("puts a counter on each of two Merfolk you control", () => {
    const { game, a } = table();
    const looter = spawn(game, "Merfolk Looter");
    const lord = spawn(game, "Lord of Atlantis");
    pickTargets(a, looter, lord);
    enter(game, "Vineshaper Mystic");
    expect(counters(game, looter)).toBe(1);
    expect(counters(game, lord)).toBe(1);
  });
});

describe("Anointed Deacon", () => {
  it("gives a target Vampire +2/+0 at the beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "Anointed Deacon");
    const nighthawk = spawn(game, "Vampire Nighthawk");
    pickTargets(a, nighthawk);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, nighthawk)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Elaborate Firecannon", () => {
  it("doesn't untap on its own, and untaps when you discard at upkeep", () => {
    const { game, a } = table();
    const cannon = spawn(game, "Elaborate Firecannon", A, { tapped: true });
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[cannon].tapped).toBe(true);
    const before = hand(game).length;
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[cannon].tapped).toBe(false);
    expect(hand(game).length).toBe(before); // one discarded, one drawn last turn
  });
});

describe("Pterodon Knight", () => {
  it("has flying only while you control a Dinosaur", () => {
    const { game } = table();
    const knight = spawn(game, "Pterodon Knight");
    expect(keywords(game, knight).has("flying")).toBe(false);
    spawn(game, "Colossal Dreadmaw");
    expect(keywords(game, knight).has("flying")).toBe(true);
  });
});

describe("Crimson Honor Guard", () => {
  it("deals 4 to the player whose end step it is, unless they control a commander", () => {
    const { game } = table();
    spawn(game, "Crimson Honor Guard");
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(20);
    toStep(game, "end", B);
    settle(game);
    expect(life(game, B)).toBe(16);
    const commander = spawn(game, "Grizzly Bears", B);
    game.state.objects[commander].isCommander = true;
    toStep(game, "end", B);
    settle(game);
    expect(life(game, B)).toBe(16);
  });

  it("any player's commander counts", () => {
    const { game } = table();
    spawn(game, "Crimson Honor Guard");
    const stolen = spawn(game, "Grizzly Bears", B);
    game.state.objects[stolen].isCommander = true;
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    expect(game.state.objects[stolen].controller).toBe(A);
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });
});

describe("Vance's Blasting Cannons", () => {
  it("exiles the top card at upkeep, which may be cast this turn", () => {
    const { game } = table();
    spawn(game, "Vance's Blasting Cannons");
    lands(game, "Mountain", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.legalActions(A).some((x) => "card" in x && x.card === bolt)).toBe(true);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });

  it("an exiled land can't be played", () => {
    const { game } = table();
    spawn(game, "Vance's Blasting Cannons");
    const land = toLibrary(game, "Mountain");
    toStep(game, "upkeep");
    settle(game);
    toStep(game, "precombat-main");
    expect(zone(game, land)).toBe("exile");
    expect(game.legalActions(A).some((x) => "card" in x && x.card === land)).toBe(false);
  });

  it("transforms on the third spell, and Spitfire Bastion deals 3", () => {
    const { game, a } = table();
    const cannons = spawn(game, "Vance's Blasting Cannons");
    pickModes(a, 0);
    for (let i = 0; i < 3; i++) cast(game, toHand(game, "Ornithopter"));
    expect(game.state.objects[cannons].face).toBe(1);
    lands(game, "Mountain", 3);
    activate(game, cannons, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Storm Fleet Aerialist", () => {
  it("enters with a counter only if you attacked this turn", () => {
    const { game, a } = table();
    expect(counters(game, enter(game, "Storm Fleet Aerialist"))).toBe(0);
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    expect(counters(game, enter(game, "Storm Fleet Aerialist"))).toBe(1);
  });
});
