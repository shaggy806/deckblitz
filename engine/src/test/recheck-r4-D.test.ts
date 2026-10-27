import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("recheck R4, group D", () => {
  it("Countermand: a spell that can't be countered stays, but its controller still mills four", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const decay = toHand(game, "Abrupt Decay", B);
    lands(game, "Swamp", 1, B);
    lands(game, "Forest", 1, B);
    const countermand = toHand(game, "Countermand", A);
    lands(game, "Island", 4, A);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, decay, { player: B, targets: [ref(bears)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    const before = graveyard(game, B).length;
    cast(game, countermand, { targets: [ref(decay)] });
    expect(zone(game, bears)).toBe("graveyard");
    // Four milled, plus the Decay itself once it resolved.
    expect(graveyard(game, B).length).toBe(before + 5);
  });

  it("Grisly Spectacle: the destroyed creature's controller mills its power", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 4, A);
    const before = graveyard(game, B).length;
    cast(game, toHand(game, "Grisly Spectacle"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(graveyard(game, B).length).toBe(before + 1 + 3);
  });

  it("Zulaport Duelist: the target's controller mills two; with no target, no one mills", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const beforeB = graveyard(game, B).length;
    const beforeA = graveyard(game, A).length;
    pickTargets(a, bears);
    enter(game, "Zulaport Duelist");
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
    expect(graveyard(game, B).length).toBe(beforeB + 2);
    pickTargets(a, null);
    enter(game, "Zulaport Duelist");
    expect(graveyard(game, B).length).toBe(beforeB + 2);
    expect(graveyard(game, A).length).toBe(beforeA);
  });

  it("Glacial Grasp: an already-tapped creature still skips its next untap; its controller mills two", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Island", 3, A);
    const beforeB = graveyard(game, B).length;
    const beforeHand = hand(game, A).length;
    cast(game, toHand(game, "Glacial Grasp"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].skipsNextUntap).toBe(true);
    expect(graveyard(game, B).length).toBe(beforeB + 2);
    expect(hand(game, A).length).toBe(beforeHand + 1);
  });

  it("Domineering Will: the target player takes the creatures, untapped, and each must block", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 4, A);
    cast(game, toHand(game, "Domineering Will"), { targets: [ref(A), ref(bears), ref(giant)] });
    expect(controller(game, bears)).toBe(A);
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect((game.state.blockRequirements ?? []).map((r) => r.blocker).sort()).toEqual([bears, giant].sort());
  });

  it("Avalanche Tusker: the target creature must block it", () => {
    const { game, a } = table();
    const tusker = spawn(game, "Avalanche Tusker");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const offer = blockOffer(game, a, [tusker]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: tusker }]);
  });

  it("Grappling Hook: you may have the target creature block the equipped attacker", () => {
    const { game, a } = table();
    const hook = spawn(game, "Grappling Hook");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4, A);
    activate(game, hook, 0, { targets: [ref(giant)] });
    pickTargets(a, bears);
    pickModes(a, 0);
    const offer = blockOffer(game, a, [giant]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: giant }]);
  });

  it("Courtly Provocateur: the second ability makes the target block this turn", () => {
    const { game, a } = table();
    const provocateur = spawn(game, "Courtly Provocateur");
    const attacker = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, provocateur, 1, { targets: [ref(bears)] });
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.blockRequirements?.map((r) => r.blocker)).toEqual([bears]);
  });
});
