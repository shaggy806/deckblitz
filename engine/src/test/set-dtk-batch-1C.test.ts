import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  grant,
  keywords,
  lands,
  life,
  hand,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";
import type { ScriptedController } from "../controller.js";

/** Answer each modes question (a `may` included) with the next of these. */
function modesInOrder(seat: ScriptedController, ...answers: readonly (readonly number[])[]): void {
  const queue = [...answers];
  seat.chooseModesFn = () => [...(queue.shift() ?? [])];
}

describe("Dragons of Tarkir — group C", () => {
  it("Profaner of the Dead bounces opponents' creatures with less toughness than the exploited one", () => {
    const { game, a } = table();
    const victim = spawn(game, "Craw Wurm"); // 6/4
    const small = spawn(game, "Grizzly Bears", B); // 2/2
    const equal = spawn(game, "Hill Giant", B); // 3/3
    const big = spawn(game, "Craw Wurm", B); // 6/4 — not less than 4
    const mine = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, victim);
    enter(game, "Profaner of the Dead");
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, small)).toBe("hand");
    expect(zone(game, equal)).toBe("hand");
    expect(zone(game, big)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Descent of the Dragons gives each controller a Dragon per creature actually destroyed", () => {
    const { game, a } = table();
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobWurm = spawn(game, "Craw Wurm", B);
    grant(game, bobWurm, "indestructible");
    const aliceBears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 6);
    pickTargets(a, bobBears, bobWurm, aliceBears);
    cast(game, toHand(game, "Descent of the Dragons"), {
      targets: [ref(bobBears), ref(bobWurm), ref(aliceBears)],
    });
    expect(zone(game, bobBears)).toBe("graveyard");
    expect(zone(game, bobWurm)).toBe("battlefield");
    expect(zone(game, aliceBears)).toBe("graveyard");
    expect(tokensNamed(game, "Dragon Token (Dragonback Assault)", B)).toBe(1);
    expect(tokensNamed(game, "Dragon Token (Dragonback Assault)", A)).toBe(1);
  });

  it("Arashin Sovereign's controller may put it on the bottom of its owner's library", () => {
    const { game, a } = table();
    const sovereign = spawn(game, "Arashin Sovereign");
    modesInOrder(a, [0], [1]);
    destroy(game, sovereign);
    const library = game.state.zones.perPlayer[A].library;
    expect(zone(game, sovereign)).toBe("library");
    expect(library[library.length - 1]).toBe(sovereign);
  });

  it("Ojutai's Command's chosen modes resolve together", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Ojutai's Command"), { modes: [1, 3] });
    expect(life(game)).toBe(24);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Encase in Ice enchants only a red or green creature, and taps it", () => {
    const { game } = table();
    const drake = spawn(game, "Wind Drake", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    const encase = toHand(game, "Encase in Ice");
    expect(() => cast(game, encase, { targets: [ref(drake)], settle: false })).toThrow(/refused/);
    cast(game, encase, { targets: [ref(bears)] });
    expect(game.state.objects[encase].attachedTo).toBe(bears);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Scale Blessing bolsters 1, then adds a counter to each creature with one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears"); // least toughness
    const wurm = spawn(game, "Craw Wurm");
    game.state.objects[wurm].counters["+1/+1"] = 1;
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 4);
    pickPermanents(a, bears);
    cast(game, toHand(game, "Scale Blessing"));
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, wurm)).toBe(2);
    expect(counters(game, giant)).toBe(0);
  });

  it("Kolaghan Forerunners's power is the number of creatures you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const forerunners = spawn(game, "Kolaghan Forerunners");
    expect(pt(game, forerunners)).toEqual({ power: 2, toughness: 3 });
  });

  it("Sabertooth Outrider gains first strike only when formidable", () => {
    const { game, a } = table();
    const outrider = spawn(game, "Sabertooth Outrider");
    spawn(game, "Grizzly Bears"); // 4 + 2 = 6
    a.declareAttackersFn = () => [{ attacker: outrider, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(keywords(game, outrider).has("first-strike")).toBe(false);

    const { game: g2, a: a2 } = table();
    const outrider2 = spawn(g2, "Sabertooth Outrider");
    spawn(g2, "Craw Wurm"); // 4 + 6 = 10
    a2.declareAttackersFn = () => [{ attacker: outrider2, defender: B }];
    g2.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(keywords(g2, outrider2).has("first-strike")).toBe(true);
  });

  it("Glade Watcher can attack only after its formidable ability", () => {
    const { game, a } = table();
    const watcher = spawn(game, "Glade Watcher");
    lands(game, "Forest", 1);
    expect(() => activate(game, watcher)).toThrow(/refused/);
    spawn(game, "Craw Wurm"); // 3 + 6 = 9
    activate(game, watcher);
    attack(game, a, [watcher]);
    expect(life(game, B)).toBe(17);
  });

  it("Stormrider Rig may attach itself to a creature entering under your control", () => {
    const { game, a } = table();
    const rig = spawn(game, "Stormrider Rig");
    pickModes(a, 0);
    const bears = enter(game, "Grizzly Bears");
    expect(game.state.objects[rig].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Tapestry of the Ages draws only after a noncreature spell this turn", () => {
    const { game } = table();
    const tapestry = spawn(game, "Tapestry of the Ages");
    lands(game, "Wastes", 2);
    expect(() => activate(game, tapestry)).toThrow(/refused/);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    const before = hand(game).length;
    activate(game, tapestry);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Dragonloft Idol gets +1/+1, flying and trample while you control a Dragon", () => {
    const { game } = table();
    const idol = spawn(game, "Dragonloft Idol");
    expect(pt(game, idol)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Shivan Dragon");
    expect(pt(game, idol)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, idol).has("flying")).toBe(true);
    expect(keywords(game, idol).has("trample")).toBe(true);
  });
});
