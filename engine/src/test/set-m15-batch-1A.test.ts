import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  lands,
  pickTargets,
  pt,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("M15 / Conspiracy batch 1, group A", () => {
  it("Return to the Ranks returns X creature cards with mana value 2 or less", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const isamaru = toGraveyard(game, "Isamaru, Hound of Konda");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Return to the Ranks"), {
      x: 2,
      targets: [
        { kind: "object", object: bears },
        { kind: "object", object: isamaru },
      ],
    });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, isamaru)).toBe("battlefield");
  });

  it("Return to the Ranks can't target a creature card with mana value 3", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Plains", 3);
    expect(() =>
      cast(game, toHand(game, "Return to the Ranks"), { x: 1, targets: [{ kind: "object", object: giant }] }),
    ).toThrow();
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Drakestown Forgotten enters with a counter per creature card in all graveyards", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Plains", B);
    const drakestown = enter(game, "Drakestown Forgotten");
    expect(counters(game, drakestown)).toBe(3);
    expect(pt(game, drakestown)).toEqual({ power: 3, toughness: 3 });
  });

  it("Warden of the Beyond gets +2/+2 only while an opponent owns a card in exile", () => {
    const { game } = table();
    const warden = spawn(game, "Warden of the Beyond");
    toExile(game, "Grizzly Bears", A);
    expect(pt(game, warden)).toEqual({ power: 2, toughness: 2 });
    toExile(game, "Grizzly Bears", B);
    expect(pt(game, warden)).toEqual({ power: 4, toughness: 4 });
  });

  it("Jalira puts the first nonlegendary creature card onto the battlefield", () => {
    const { game } = table();
    const jalira = spawn(game, "Jalira, Master Polymorphist");
    const fodder = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const giant = toLibrary(game, "Hill Giant");
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda"); // on top: legendary, skipped
    game.dispatch({ type: "activate-ability", player: A, source: jalira, abilityIndex: 0, targets: [], sacrifice: fodder });
    game.advanceUntil(
      (s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0,
    );
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, isamaru)).toBe("library");
  });

  it("Cruel Sadist deals X damage by removing X counters", () => {
    const { game, a } = table();
    const sadist = spawn(game, "Cruel Sadist");
    game.state.objects[sadist].counters["+1/+1"] = 3;
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 3);
    pickTargets(a, giant);
    activate(game, sadist, 1, { x: 3, targets: [{ kind: "object", object: giant }] });
    expect(counters(game, sadist)).toBe(0);
    expect(zone(game, giant)).toBe("graveyard");
  });
});
